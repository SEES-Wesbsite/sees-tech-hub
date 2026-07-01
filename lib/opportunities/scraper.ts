import { createAdminClient } from '@/lib/supabase/server'
import { generateWithAi } from '@/lib/ai/generate'
import { extract } from '@extractus/article-extractor'
import { z } from 'zod'

// 1. Zod Schema for strict validation
const OpportunitySchema = z.object({
  title: z.string(),
  organization: z.string(),
  description: z.string(),
  summary: z.string(),
  application_url: z.string(),
  opportunity_type: z.enum(["job", "internship", "hackathon", "scholarship", "fellowship", "grant", "competition", "bootcamp", "event", "other"]),
  location_type: z.enum(["remote", "onsite", "hybrid", "unspecified"]),
  location: z.string().nullable().optional(),
  compensation: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  tags: z.array(z.string()),
  relevance_score: z.number().min(1).max(10)
})

const ScraperResultSchema = z.object({
  opportunities: z.array(OpportunitySchema)
})

const SYSTEM_PROMPT = `
You are an Opportunity Normalization Engine.
Your job is to extract raw text and convert it into a structured JSON array of opportunities.
You MUST output ONLY valid JSON matching the following schema. No markdown wrappers.
{
  "opportunities": [
    {
      "title": string,
      "organization": string,
      "description": string (clean markdown),
      "summary": string (1-2 sentences),
      "application_url": string,
      "opportunity_type": "job" | "internship" | "hackathon" | "scholarship" | "fellowship" | "grant" | "competition" | "bootcamp" | "event" | "other",
      "location_type": "remote" | "onsite" | "hybrid" | "unspecified",
      "location": string or null,
      "compensation": string or null,
      "deadline": string (ISO 8601) or null,
      "tags": [string],
      "relevance_score": number (1-10, reject spam/expired with score < 7)
    }
  ]
}
`

// Helper: Process array in concurrent chunks
async function processInChunks<T, R>(items: T[], chunkSize: number, processor: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(chunk.map(processor))
    results.push(...chunkResults)
  }
  return results
}

// Helper: Generate dynamic boolean queries
function generateQueries(count: number): string[] {
  const domains = ['site:boards.greenhouse.io', 'site:lever.co', 'site:jobs.ashbyhq.com', 'site:wellfound.com']
  const roles = ['"software engineer"', '"frontend developer"', '"react developer"', '"fullstack"', '"product manager"', '"data scientist"']
  const modifiers = ['internship OR intern', 'remote OR hybrid', 'graduate OR "new grad"']
  
  const queries = []
  for (let i = 0; i < count; i++) {
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const role = roles[Math.floor(Math.random() * roles.length)]
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    queries.push(`${domain} ${role} ${modifier}`)
  }
  return [...new Set(queries)] // return unique
}

/**
 * Core autonomous scraper pipeline.
 */
export async function scrapeAndInsertOpportunities(): Promise<{ processed: number; items: any[] }> {
  const supabase = await createAdminClient()
  const SERPAPI_KEY = process.env.SERPAPI_KEY

  if (!SERPAPI_KEY) {
    console.warn("SERPAPI_KEY is not set. Skipping autonomous search.")
    return { processed: 0, items: [] }
  }

  // 1. Generate 8 targeted boolean queries (for a 250/mo limit on SerpAPI = ~8/day)
  const queries = generateQueries(8)
  const allUrls = new Set<string>()

  console.log(`Running ${queries.length} search queries...`)
  
  // 2. Fetch URLs from SerpAPI
  for (const q of queries) {
    try {
      const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}`, {
        signal: AbortSignal.timeout(15000),
        cache: 'no-store'
      })
      if (!res.ok) {
        console.error(`SerpAPI returned ${res.status} for query: ${q}`)
        continue
      }
      const data = await res.json()
      if (data.error) {
        console.error(`SerpAPI error payload for query ${q}:`, data.error)
      }
      
      const links = data.organic_results?.map((r: any) => r.link) || []
      console.log(`Query "${q}" returned ${links.length} results.`)
      links.forEach((l: string) => allUrls.add(l))
    } catch (e) {
      console.error("SerpAPI error:", e)
    }
  }

  const urls = Array.from(allUrls)
  console.log(`Discovered ${urls.length} unique URLs.`)

  if (urls.length === 0) return { processed: 0, items: [] }

  // 3. Deduplicate against database
  const { data: existing } = await supabase
    .from('opportunities')
    .select('application_url')
    .in('application_url', urls)
  
  const existingUrls = new Set(existing?.map(e => e.application_url) || [])
  const newUrls = urls.filter(u => !existingUrls.has(u))

  console.log(`${newUrls.length} new URLs to process.`)
  if (newUrls.length === 0) return { processed: 0, items: [] }

  // 4. Fetch and Extract HTML in chunks (limit concurrency to 3)
  const validOpportunities: any[] = []

  await processInChunks(newUrls, 3, async (url) => {
    try {
      console.log(`Extracting: ${url}`)
      const htmlRes = await fetch(url, { signal: AbortSignal.timeout(10000) })
      const html = await htmlRes.text()
      
      const article = await extract(html)
      if (!article || !article.content) return null

      // Clean text by stripping HTML tags (rough)
      const cleanText = article.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
      if (cleanText.length < 200) return null // Too short to be a real job

      // 5. AI Normalization
      const aiOutput = await generateWithAi(
        `Extract opportunities from the following job listing. URL: ${url}\n\nContent:\n${cleanText.substring(0, 8000)}`,
        { systemPrompt: SYSTEM_PROMPT }
      )

      let parsed: any
      try {
        const cleaned = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim()
        parsed = JSON.parse(cleaned)
      } catch (e) {
        console.error("Failed to parse AI JSON for", url)
        return null
      }

      // 6. Validate Schema
      const result = ScraperResultSchema.safeParse(parsed)
      if (result.success) {
        const highQualityOpps = result.data.opportunities.filter(o => o.relevance_score >= 7)
        // Force the original URL just in case AI hallucinates it
        const finalized = highQualityOpps.map(o => ({ ...o, application_url: url, status: 'pending_review' }))
        validOpportunities.push(...finalized)
      } else {
        console.warn("AI validation failed for", url, result.error.message)
      }

    } catch (e) {
      console.error(`Failed processing ${url}:`, e)
    }
    return null
  })

  // 7. Insert to Supabase
  if (validOpportunities.length === 0) {
    return { processed: 0, items: [] }
  }

  // Remove relevance_score before insert as it's not in schema
  const inserts = validOpportunities.map(({ relevance_score, ...rest }) => rest)

  console.log(`Inserting ${inserts.length} normalized opportunities.`)

  const { data, error } = await supabase
    .from('opportunities')
    .insert(inserts)
    .select()

  // Note: We use ON CONFLICT at the DB level, but the JS client will error on conflict 
  // without upsert. Let's gracefully catch duplicate errors or use upsert.
  if (error && error.code !== '23505') { // Ignore unique violation if it happened concurrently
    console.error('Scraper DB insert error:', error)
    throw error
  }

  return { processed: inserts.length, items: data || [] }
}
