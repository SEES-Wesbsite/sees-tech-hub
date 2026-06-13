import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsClient } from './events-client'
import type { Event } from '@/lib/types'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  // Fetch user RSVPs (event attendances)
  const { data: rsvps } = await supabase
    .from('event_attendances')
    .select('event_id')
    .eq('user_id', user.id)

  const rsvpSet = new Set(rsvps?.map(r => r.event_id) ?? [])

  return (
    <EventsClient 
      initialEvents={(events ?? []) as Event[]} 
      initialRsvps={Array.from(rsvpSet)} 
    />
  )
}
