import { createAdminClient } from '@/lib/supabase/server'
import { generateWithAi } from '@/lib/ai/generate'

const SYSTEM_PROMPT = `
You are an Opportunity Normalization Engine.
Your job is to extract raw text and convert it into a structured JSON array of opportunities.
You MUST output ONLY valid JSON. No markdown wrappers around the JSON, just the raw array.
Array schema for each object:
{
  "title": string,
  "organization": string,
  "description": string (formatted in clean markdown),
  "summary": string (a crisp 1-2 sentence summary),
  "application_url": string (or "https://example.com/apply" if missing),
  "opportunity_type": enum("job", "internship", "hackathon", "scholarship", "fellowship", "grant", "competition", "bootcamp", "event", "other"),
  "location_type": enum("remote", "onsite", "hybrid", "unspecified"),
  "location": string or null,
  "compensation": string or null,
  "deadline": string (ISO 8601 format) or null,
  "tags": array of strings (e.g. ["react", "frontend", "open source"])
}
`

/**
 * Core scraper function that uses the admin client to bypass RLS.
 * This is a system-level operation — scraped opportunities are not owned by any user.
 * Can be called from the cron API route or directly from admin server actions.
 */
export async function scrapeAndInsertOpportunities(): Promise<{ processed: number; items: any[] }> {
  const supabase = await createAdminClient()

  // Mock Scraper: In production, use Cheerio/Puppeteer to fetch raw listings from public boards
  const rawScrapedContent = `
  Listing 1:
  Frontend React Developer Intern at TechNova Inc. 
  We are looking for a remote intern to join us for 3 months. Pay is $2000/month.
  You need to know React, TypeScript, and Tailwind.
  Apply at https://technova.inc/careers/intern before 2026-08-01.

  Listing 2:
  Global Health Hackathon 2026
  Location: Hybrid (London, UK / Online).
  Join us for a 48-hour sprint to build health-tech solutions. $50,000 prize pool!
  Open to all students and professionals.
  Sign up at https://healthhack.org/2026. Deadline to register is next week, 2026-07-15.
  `

  const aiOutput = await generateWithAi(
    `Extract opportunities from the following text:\n\n${rawScrapedContent}`,
    { systemPrompt: SYSTEM_PROMPT }
  )

  // Parse JSON safely
  let parsed: any
  try {
    parsed = JSON.parse(aiOutput)
  } catch {
    // Sometimes the model wraps in ```json ... ```
    const cleaned = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim()
    parsed = JSON.parse(cleaned)
  }

  // Handle case where model returns { "opportunities": [...] } instead of a raw array
  if (!Array.isArray(parsed)) {
    if (parsed && Array.isArray(parsed.opportunities)) {
      parsed = parsed.opportunities
    } else {
      throw new Error('Model did not return a valid array of opportunities.')
    }
  }

  const inserts = parsed.map((opp: any) => ({
    title: opp.title,
    organization: opp.organization,
    description: opp.description,
    summary: opp.summary,
    application_url: opp.application_url,
    opportunity_type: opp.opportunity_type,
    location_type: opp.location_type,
    location: opp.location || null,
    compensation: opp.compensation || null,
    deadline: opp.deadline || null,
    tags: opp.tags || [],
    status: 'pending_review'
  }))

  const { data, error } = await supabase
    .from('opportunities')
    .insert(inserts)
    .select()

  if (error) {
    console.error('Scraper DB insert error:', error)
    throw error
  }

  return { processed: inserts.length, items: data || [] }
}
