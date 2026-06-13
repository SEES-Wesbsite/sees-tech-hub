'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleRsvp(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check if RSVP exists
  const { data: existing } = await supabase
    .from('event_attendances')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()

  if (existing) {
    // Delete RSVP
    await supabase.from('event_attendances').delete().eq('id', existing.id)
  } else {
    // Insert RSVP
    await supabase.from('event_attendances').insert({ user_id: user.id, event_id: eventId })
  }

  revalidatePath('/events', 'page')
  return { success: true }
}
