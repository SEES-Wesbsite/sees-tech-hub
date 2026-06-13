'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toggleRsvp } from '@/app/actions/events'
import { motion } from 'motion/react'
import { Calendar as CalendarIcon, MapPin, Sparkles, Check } from 'lucide-react'
import type { Event } from '@/lib/types'

type Props = {
  initialEvents: Event[]
  initialRsvps: string[]
}

export function EventsClient({ initialEvents, initialRsvps }: Props) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
      return (data ?? []) as Event[]
    },
    initialData: initialEvents,
  })

  // We maintain rsvps in a local query state for optimistic toggling
  const { data: rsvps } = useQuery({
    queryKey: ['rsvps'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return initialRsvps
      const { data } = await supabase.from('event_attendances').select('event_id').eq('user_id', user.id)
      return data?.map(r => r.event_id) ?? initialRsvps
    },
    initialData: initialRsvps,
  })

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await toggleRsvp(eventId)
      return eventId
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ['rsvps'] })
      const previousRsvps = queryClient.getQueryData<string[]>(['rsvps'])
      queryClient.setQueryData<string[]>(['rsvps'], old => {
        if (!old) return [eventId]
        return old.includes(eventId) ? old.filter(id => id !== eventId) : [...old, eventId]
      })
      return { previousRsvps }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['rsvps'], context?.previousRsvps)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] })
    },
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-brand" />
          Events &amp; Meetups
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Don&apos;t miss the next STH gathering.</p>
      </motion.div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <p className="text-lg font-medium text-muted-foreground">No upcoming events currently scheduled.</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="space-y-4"
        >
          {events.map(event => {
            const date = new Date(event.event_date)
            const isAttending = rsvps.includes(event.id)

            return (
              <motion.div 
                key={event.id}
                variants={itemVariants}
                className="bg-card border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-5 relative">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-muted/30 border border-border shrink-0">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{date.toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-black text-foreground leading-none">{date.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className="flex items-center gap-1.5 text-foreground/80">
                        <MapPin className="w-4 h-4 text-brand" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-foreground/80">
                        <Sparkles className="w-4 h-4 text-warning" />
                        +{event.points_awarded} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative shrink-0 md:w-40 flex flex-col justify-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => rsvpMutation.mutate(event.id)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isAttending 
                        ? 'bg-brand/20 text-brand hover:bg-brand/30' 
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    {isAttending ? (
                      <><Check className="w-4 h-4" /> Attending</>
                    ) : (
                      'RSVP'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
