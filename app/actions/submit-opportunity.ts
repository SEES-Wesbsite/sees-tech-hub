'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWithAi } from '@/lib/ai/generate'

const SYSTEM_PROMPT = `
You are an AI Opportunity Normalization Engine.
Your job is to extract raw text and convert it into a structured JSON object representing a single opportunity.
You MUST output ONLY valid JSON. No markdown wrappers around the JSON.
Schema:
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

export async function submitCommunityOpportunity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized. You must be logged in to submit opportunities.' }

  const url = formData.get('url') as string
  const rawText = formData.get('description') as string

  if (!url || !rawText) {
    return { error: 'URL and Description are required.' }
  }

  try {
    const aiOutput = await generateWithAi(
      `Please extract the opportunity from the following user submission:\n\nURL: ${url}\n\nDescription: ${rawText}`,
      { systemPrompt: SYSTEM_PROMPT }
    )

    let parsed: any
    try {
      parsed = JSON.parse(aiOutput)
    } catch (err) {
      const cleaned = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    if (!parsed || !parsed.title) {
      throw new Error("AI failed to parse the opportunity correctly.")
    }

    const insertData = {
      title: parsed.title,
      organization: parsed.organization,
      description: parsed.description,
      summary: parsed.summary,
      application_url: parsed.application_url || url,
      opportunity_type: parsed.opportunity_type,
      location_type: parsed.location_type,
      location: parsed.location || null,
      compensation: parsed.compensation || null,
      deadline: parsed.deadline || null,
      tags: parsed.tags || [],
      status: 'pending_review',
      created_by: user.id
    }

    const { error } = await supabase
      .from('opportunities')
      .insert(insertData)

    if (error) {
      console.error("Submission insert error:", error)
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Submit Opportunity Error:", error)
    return { error: error.message || 'An error occurred while processing your submission.' }
  }
}
