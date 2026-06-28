'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Calendar, MapPin, Zap, Users, ChevronDown, CheckCircle } from 'lucide-react'
import { toggleRsvp } from '@/app/actions/events'
import { ClaimDrawer } from './claim-drawer'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader } from '@/components/ui/loader'
import { MarkdownViewer } from '@/components/ui/markdown-viewer'
import { RSVPSuccessModal } from '@/components/ui/rsvp-success-modal'

interface EventsClientProps {
  upcomingAndLiveEvents: any[]
  pastEvents: any[]
}

export function EventsClient({ upcomingAndLiveEvents, pastEvents }: EventsClientProps) {
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)
  const [claimOpen, setClaimOpen] = useState(false)
  const [selectedClaimEvent, setSelectedClaimEvent] = useState<any | null>(null)
  const [showPast, setShowPast] = useState(false)
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false)
  const [lastRsvpedEvent, setLastRsvpedEvent] = useState<any | null>(null)

  // Optimistic UI state for RSVPs
  const [localEvents, setLocalEvents] = useState(upcomingAndLiveEvents)

  const handleRsvp = async (eventId: string, currentStatus: boolean) => {
    setLoadingEventId(eventId)
    
    const res = await toggleRsvp(eventId)
    setLoadingEventId(null)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      // Update state only after successful response
      setLocalEvents(prev => prev.map(evt => {
        if (evt.id === eventId) {
          const updated = {
            ...evt,
            isGoing: !currentStatus,
            rsvpCount: currentStatus ? evt.rsvpCount - 1 : evt.rsvpCount + 1
          }
          if (!currentStatus) {
            setLastRsvpedEvent(updated)
          }
          return updated
        }
        return evt
      }))
      if (!currentStatus) {
        setRsvpModalOpen(true)
      } else {
        toast.success("RSVP Cancelled.")
      }
    }
  }

  const liveEvents = localEvents.filter(e => e.status === 'live')
  const upcomingEvents = localEvents.filter(e => e.status === 'upcoming')

  // Luma style avatars renderer
  const renderLumaAvatars = (avatars: string[], rsvpCount: number) => {
    if (rsvpCount === 0) return null
    return (
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
        <div className="flex -space-x-2">
          {avatars.map((url, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-background overflow-hidden relative bg-muted">
              {url ? (
                <Image src={url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand/40" />
              )}
            </div>
          ))}
          {rsvpCount > avatars.length && (
            <div className="w-6 h-6 rounded-full border-2 border-background bg-foreground/10 flex items-center justify-center text-[8px] font-bold text-muted-foreground z-10">
              +{rsvpCount - avatars.length}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {rsvpCount} going
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Live / Featured Events */}
      {liveEvents.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <h2 className="text-2xl font-bold font-serif text-foreground">Live Now</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map(evt => (
              <motion.div 
                key={evt.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full md:col-span-2 lg:col-span-2 bg-gradient-to-br from-brand/5 to-transparent border-2 border-brand/20 rounded-3xl overflow-hidden relative flex flex-col md:flex-row group"
              >
                {/* Image Section */}
                <div className="w-full md:w-1/2 h-48 md:h-auto relative bg-muted">
                  {evt.cover_image_url ? (
                    <Image src={evt.cover_image_url} alt={evt.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand-dark/40 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-brand/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 md:from-transparent md:bg-gradient-to-r md:to-transparent to-transparent pointer-events-none" />
                </div>
                
                {/* Content Section */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-background/50 backdrop-blur-sm">
                  <Badge className="w-fit bg-success text-success-foreground mb-4">HAPPENING NOW</Badge>
                  <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-2 leading-tight">{evt.title}</h3>
                  {evt.description && (
                    <div className="mb-4 text-muted-foreground opacity-90 line-clamp-3">
                      <MarkdownViewer content={evt.description} className="prose-sm dark:prose-invert" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{evt.location || 'TBA'}</span>
                  </div>

                  {evt.isClaimed ? (
                    <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center justify-center gap-3 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold">Points Claimed! (+{evt.points_awarded} XP)</span>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-brand hover:bg-brand-light text-brand-dark rounded-xl h-14 text-lg font-bold shadow-[0_0_20px_rgba(2,92,72,0.2)] group-hover:shadow-[0_0_30px_rgba(2,92,72,0.4)] transition-all duration-300"
                      onClick={() => {
                        setSelectedClaimEvent(evt)
                        setClaimOpen(true)
                      }}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Claim {evt.points_awarded} XP
                    </Button>
                  )}

                  {/* Luma Avatars for Live Event */}
                  {renderLumaAvatars(evt.attendeeAvatars || [], evt.rsvpCount)}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-foreground">Upcoming</h2>
        
        {upcomingEvents.length === 0 ? (
          <div className="bg-foreground/5 border border-border/50 rounded-3xl p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">No upcoming events scheduled at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(evt => (
              <motion.div 
                key={evt.id}
                whileHover={{ y: -5 }}
                className="bg-foreground/5 border border-border/50 rounded-3xl overflow-hidden flex flex-col hover:border-border transition-colors"
              >
                {/* Event Cover Image (smaller for grid) */}
                <div className="w-full h-32 relative bg-muted">
                  {evt.cover_image_url ? (
                    <Image src={evt.cover_image_url} alt={evt.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand/10 to-brand-dark/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 flex gap-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur font-mono text-brand font-bold">
                      +{evt.points_awarded} XP
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold font-serif text-foreground mb-2 line-clamp-2">{evt.title}</h3>
                  
                  {evt.description && (
                    <div className="mb-4 text-muted-foreground opacity-80 line-clamp-2 text-sm">
                      <MarkdownViewer content={evt.description} className="prose-sm dark:prose-invert text-sm" />
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-start gap-3 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4 mt-0.5 text-foreground/50 shrink-0" />
                      <span>{format(new Date(evt.event_date), 'EEEE, MMMM d • h:mm a')}</span>
                    </div>
                    <div className="flex items-start gap-3 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-foreground/50 shrink-0" />
                      <span>{evt.location || 'Location TBA'}</span>
                    </div>
                  </div>

                  {renderLumaAvatars(evt.attendeeAvatars || [], evt.rsvpCount)}

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      variant={evt.isGoing ? "secondary" : "default"}
                      className={`w-full rounded-xl transition-all duration-300 ${!evt.isGoing && 'bg-foreground text-background hover:bg-foreground/90'}`}
                      onClick={() => handleRsvp(evt.id, evt.isGoing)}
                      disabled={loadingEventId === evt.id}
                    >
                      {loadingEventId === evt.id ? (
                        <span className="flex items-center gap-2"><Loader className="w-4 h-4 text-current" variant="simple-spin" /> Updating...</span>
                      ) : evt.isGoing ? (
                        <span className="flex items-center gap-2 text-success"><CheckCircle className="w-4 h-4" /> Going</span>
                      ) : (
                        "RSVP"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="pt-8 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 h-auto text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-2xl"
            onClick={() => setShowPast(!showPast)}
          >
            <span className="text-lg font-medium">Past Events ({pastEvents.length})</span>
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showPast ? 'rotate-180' : ''}`} />
          </Button>
          
          <AnimatePresence>
            {showPast && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                  {pastEvents.map(evt => (
                    <div key={evt.id} className="bg-foreground/5 rounded-2xl p-5 border border-border/50 opacity-70 grayscale hover:grayscale-0 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground line-clamp-1">{evt.title}</h4>
                        {evt.isClaimed && <Zap className="w-4 h-4 text-brand shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(evt.event_date), 'MMM d, yyyy')} • {evt.rsvpCount} attended
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {selectedClaimEvent && (
        <ClaimDrawer 
          open={claimOpen} 
          onOpenChange={setClaimOpen} 
          eventId={selectedClaimEvent.id}
          eventTitle={selectedClaimEvent.title}
        />
      )}

      {lastRsvpedEvent && (
        <RSVPSuccessModal 
          open={rsvpModalOpen}
          onClose={() => setRsvpModalOpen(false)}
          event={lastRsvpedEvent}
        />
      )}
    </div>
  )
}
