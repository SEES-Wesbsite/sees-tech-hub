import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsClient } from './events-client'

export const metadata = {
  title: 'Events',
  description: 'RSVP to upcoming events, attend in-person to claim live points, and level up your rank.',
  openGraph: {
    title: 'Events & RSVPs | SEES Tech Hub',
    description: 'RSVP to upcoming events, attend in-person to claim live points, and level up your rank.',
    images: ["/api/og/default?title=Hub%20Events&description=RSVP%20to%20upcoming%20events%20and%20level%20up."],
  },
  twitter: {
    images: ["/api/og/default?title=Hub%20Events&description=RSVP%20to%20upcoming%20events%20and%20level%20up."],
  },
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch upcoming & live events with Luma-style social proof data
  const { data: eventsData, error } = await supabase
    .from('events')
    .select(`
      *,
      event_attendances (
        id,
        user_id,
        rsvp_status,
        created_at,
        points_claimed,
        users (
          avatar_url
        )
      )
    `)
    .in('status', ['upcoming', 'live'])
    .order('event_date', { ascending: true })

  // 2. Fetch past completed events
  const { data: pastEventsData } = await supabase
    .from('events')
    .select(`
      *,
      event_attendances (
        id,
        user_id,
        rsvp_status,
        points_claimed
      )
    `)
    .eq('status', 'completed')
    .order('event_date', { ascending: false })

  // Process Upcoming/Live Events for the UI
  const events = (eventsData || []).map((evt: any) => {
    const attendances = evt.event_attendances || []
    
    // Check if current user is going / claimed
    const myAttendance = attendances.find((a: any) => a.user_id === user.id)
    const isGoing = myAttendance?.rsvp_status === 'going'
    const isClaimed = myAttendance?.points_claimed === true

    // Gather Luma-style attendee avatars (filter going, map avatars, get latest 5)
    const goingAttendances = attendances
      .filter((a: any) => a.rsvp_status === 'going')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const rsvpCount = goingAttendances.length
    const attendeeAvatars = goingAttendances
      .map((a: any) => a.users?.avatar_url)
      .filter(Boolean)
      .slice(0, 5)

    return {
      ...evt,
      isGoing,
      isClaimed,
      rsvpCount,
      attendeeAvatars
    }
  })

  // Process Past Events
  const pastEvents = (pastEventsData || []).map((evt: any) => {
    const attendances = evt.event_attendances || []
    const myAttendance = attendances.find((a: any) => a.user_id === user.id)
    const isClaimed = myAttendance?.points_claimed === true
    const rsvpCount = attendances.filter((a: any) => a.rsvp_status === 'going').length

    return {
      ...evt,
      isClaimed,
      rsvpCount
    }
  })

  return (
    <main className="w-full relative min-h-screen">
      {/* Dynamic Light Rays Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-brand/5 blur-[150px] mix-blend-screen opacity-50" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground drop-shadow-2xl">
            Hub <span className="text-gradient">Events</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
            RSVP to upcoming events, attend in-person to claim live points, and level up your rank.
          </p>
        </div>

        <EventsClient 
          upcomingAndLiveEvents={events} 
          pastEvents={pastEvents}
        />
      </div>
    </main>
  )
}
