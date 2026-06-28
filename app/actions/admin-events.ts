'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Helper for admin checks
async function checkAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'admin') throw new Error('Unauthorized')
}

// Zod schema for event validation
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  event_date: z.string().min(1, 'Event date is required'),
  location: z.string().optional().or(z.literal('')),
  event_type: z.enum(['hackathon', 'alumni_talk', 'dsa_sprint', 'general', 'other']),
  points_awarded: z.coerce.number().int().min(0),
  claim_code: z.string().optional().or(z.literal('')),
  claim_expires_at: z.string().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  meeting_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['upcoming', 'live', 'completed', 'cancelled']).default('upcoming'),
})

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const validatedData = eventSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      event_date: formData.get('eventDate'),
      location: formData.get('location'),
      event_type: formData.get('eventType'),
      points_awarded: formData.get('pointsAwarded'),
      claim_code: formData.get('claimCode'),
      claim_expires_at: formData.get('claimExpiresAt'),
      cover_image_url: formData.get('coverImageUrl'),
      meeting_url: formData.get('meetingUrl'),
      status: formData.get('status') || 'upcoming',
    })
    
    // Cleanup empty strings to nulls
    const description = validatedData.description || null
    const location = validatedData.location || null
    const claim_code = validatedData.claim_code || null
    const claim_expires_at = validatedData.claim_expires_at || null
    const cover_image_url = validatedData.cover_image_url || null
    const meeting_url = validatedData.meeting_url || null

    const { error } = await supabase.from('events').insert({
      title: validatedData.title,
      description,
      event_date: validatedData.event_date,
      location,
      event_type: validatedData.event_type,
      points_awarded: validatedData.points_awarded,
      claim_code,
      claim_expires_at,
      cover_image_url,
      meeting_url,
      status: validatedData.status
    })
    
    if (error) throw error
    revalidatePath('/admin/events')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0].message }
    }
    return { error: err.message || 'An error occurred' }
  }
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const validatedData = eventSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      event_date: formData.get('eventDate'),
      location: formData.get('location'),
      event_type: formData.get('eventType'),
      points_awarded: formData.get('pointsAwarded'),
      claim_code: formData.get('claimCode'),
      claim_expires_at: formData.get('claimExpiresAt'),
      cover_image_url: formData.get('coverImageUrl'),
      meeting_url: formData.get('meetingUrl'),
      status: formData.get('status'),
    })
    
    const description = validatedData.description || null
    const location = validatedData.location || null
    const claim_code = validatedData.claim_code || null
    const claim_expires_at = validatedData.claim_expires_at || null
    const cover_image_url = validatedData.cover_image_url || null
    const meeting_url = validatedData.meeting_url || null

    const { error } = await supabase.from('events').update({
      title: validatedData.title,
      description,
      event_date: validatedData.event_date,
      location,
      event_type: validatedData.event_type,
      points_awarded: validatedData.points_awarded,
      claim_code,
      claim_expires_at,
      cover_image_url,
      meeting_url,
      status: validatedData.status
    }).eq('id', id)
    
    if (error) throw error
    revalidatePath('/admin/events')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0].message }
    }
    return { error: err.message || 'An error occurred' }
  }
}

export async function setEventStatus(id: string, status: 'upcoming' | 'live' | 'completed' | 'cancelled') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const { error } = await supabase.from('events')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
    revalidatePath('/admin/events')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An error occurred' }
  }
}

export async function generateEventWithAI(prompt: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const systemPrompt = `
You are an expert Event Coordinator for a tech hub platform.
Your job is to parse the admin's prompt and generate a JSON object for a new event.

JSON SCHEMA:
{
  "title": "String (Catchy, professional title)",
  "description": "String (Markdown formatted description. Build hype, include what to expect)",
  "event_type": "Enum ('hackathon', 'alumni_talk', 'dsa_sprint', 'general', 'other')",
  "points_awarded": "Number (Integer, usually 50 to 500 based on the event scale. A simple talk is 50, a hackathon is 500)",
  "location": "String (Suggest a realistic sounding venue or 'Virtual')",
  "cover_image_url": "String (Provide a relevant Unsplash image URL using https://source.unsplash.com/random/1200x600/?tech,code... or similar)"
}

Ensure the response is valid JSON and strictly matches the schema.
`

    const { generateWithAi } = await import('@/lib/ai/generate')
    const aiResponse = await generateWithAi(prompt, { systemPrompt, provider: 'groq' })
    
    let parsed: any
    try {
      parsed = JSON.parse(aiResponse)
    } catch {
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    if (!parsed || !parsed.title) {
      throw new Error("AI returned an invalid structure.")
    }

    return { success: true, data: parsed }
  } catch (err: any) {
    return { error: err.message || 'Failed to generate event with AI' }
  }
}
