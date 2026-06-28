import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsAdminClient } from './events-admin-client'

export const metadata = {
  title: 'Manage Events | SEES Tech Hub',
}

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double check admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all events with stats
  // Note: We use raw sql or count for RSVPs and claims if possible, 
  // but for simplicity in MVP we fetch all event_attendances joined
  const { data: eventsData, error } = await supabase
    .from('events')
    .select(`
      *,
      event_attendances (
        id,
        rsvp_status,
        points_claimed
      )
    `)
    .order('event_date', { ascending: false })

  const events = (eventsData || []).map(evt => {
    const attendances = evt.event_attendances || []
    return {
      ...evt,
      rsvp_count: attendances.filter((a: any) => a.rsvp_status === 'going').length,
      claim_count: attendances.filter((a: any) => a.points_claimed).length
    }
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Events Engine</h1>
        <p className="text-muted-foreground mt-2">Create live events, set claim codes, and manage point distributions.</p>
      </div>

      <EventsAdminClient initialEvents={events} />
    </div>
  )
}
