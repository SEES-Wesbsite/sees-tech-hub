'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShortLink(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  let slug = formData.get('slug') as string
  const originalUrl = formData.get('originalUrl') as string
  const description = formData.get('description') as string

  if (!originalUrl) return { error: 'Original URL is required' }

  // Clean the slug (lowercase, replace spaces with hyphens, remove non-alphanumeric except hyphens)
  if (slug) {
    slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  } else {
    // Generate a random 6-character string if no custom slug is provided
    slug = Math.random().toString(36).substring(2, 8)
  }

  // Insert the link
  const { error } = await supabase
    .from('short_links')
    .insert({
      slug,
      destination_url: originalUrl,
      description: description || null,
      created_by: user.id
    })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'This slug is already in use.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/links', 'page')
  return { success: true }
}
