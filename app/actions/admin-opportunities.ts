'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Helper for admin checks
async function checkAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'admin') throw new Error('Unauthorized')
}

// Zod schema for opportunity validation
const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  description: z.string().min(1, 'Description is required'),
  summary: z.string().min(1, 'Summary is required'),
  application_url: z.string().url('Must be a valid URL'),
  opportunity_type: z.enum(['job', 'internship', 'hackathon', 'scholarship', 'fellowship', 'grant', 'competition', 'bootcamp', 'event', 'other']),
  location_type: z.enum(['remote', 'onsite', 'hybrid', 'unspecified']),
  location: z.string().nullable(),
  compensation: z.string().nullable(),
  deadline: z.string().nullable(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected', 'archived']),
  featured: z.boolean().default(false),
  tags: z.string().nullable().transform(str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : []),
})

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await checkAdmin(supabase, user.id)

    const rawData = {
      title: formData.get('title'),
      organization: formData.get('organization'),
      description: formData.get('description'),
      summary: formData.get('summary'),
      application_url: formData.get('application_url'),
      opportunity_type: formData.get('opportunity_type'),
      location_type: formData.get('location_type'),
      location: formData.get('location') || null,
      compensation: formData.get('compensation') || null,
      deadline: formData.get('deadline') || null,
      status: formData.get('status') || 'approved',
      featured: formData.get('featured') === 'true',
      tags: formData.get('tags'),
    }

    const validated = opportunitySchema.parse(rawData)

    const { error } = await supabase
      .from('opportunities')
      .insert({
        ...validated,
        created_by: user.id,
        published_at: validated.status === 'approved' ? new Date().toISOString() : null,
      })

    if (error) throw error

    revalidatePath('/admin/opportunities')
    revalidatePath('/opportunities')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating opportunity:', error)
    return { error: error.message || 'Failed to create opportunity' }
  }
}

export async function updateOpportunity(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await checkAdmin(supabase, user.id)

    const rawData = {
      title: formData.get('title'),
      organization: formData.get('organization'),
      description: formData.get('description'),
      summary: formData.get('summary'),
      application_url: formData.get('application_url'),
      opportunity_type: formData.get('opportunity_type'),
      location_type: formData.get('location_type'),
      location: formData.get('location') || null,
      compensation: formData.get('compensation') || null,
      deadline: formData.get('deadline') || null,
      status: formData.get('status'),
      featured: formData.get('featured') === 'true',
      tags: formData.get('tags'),
    }

    const validated = opportunitySchema.parse(rawData)

    const { error } = await supabase
      .from('opportunities')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
        published_at: validated.status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/opportunities')
    revalidatePath('/opportunities')
    revalidatePath(`/opportunities/${id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating opportunity:', error)
    return { error: error.message || 'Failed to update opportunity' }
  }
}

export async function changeOpportunityStatus(id: string, status: 'approved' | 'rejected' | 'archived') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await checkAdmin(supabase, user.id)

    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (status === 'approved') {
      updates.published_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/opportunities')
    revalidatePath('/opportunities')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to change status' }
  }
}

export async function batchApproveOpportunities(ids: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await checkAdmin(supabase, user.id)

    const { error } = await supabase
      .from('opportunities')
      .update({ 
        status: 'approved', 
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', ids)

    if (error) throw error

    revalidatePath('/admin/opportunities')
    revalidatePath('/opportunities')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to batch approve' }
  }
}

export async function triggerScraper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await checkAdmin(supabase, user.id)

    // Call the shared scraper function directly — no HTTP loopback needed.
    // The scraper uses createAdminClient() internally to bypass RLS.
    // We only run 2 queries for the manual trigger to prevent Vercel 502 Timeouts (10s limit).
    const { scrapeAndInsertOpportunities } = await import('@/lib/opportunities/scraper')
    const result = await scrapeAndInsertOpportunities(2)

    revalidatePath('/admin/opportunities')
    return { success: true, count: result.processed || 0 }
  } catch (error: any) {
    console.error('Trigger scraper error:', error)
    return { error: error.message || 'Failed to trigger scraper' }
  }
}
