"use client"

import * as React from "react"
import { CheckCircle, Share2, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Image from "next/image"
import { format } from "date-fns"
import confetti from "canvas-confetti"
import { toast } from "sonner"

interface RSVPSuccessModalProps {
  open: boolean
  onClose: () => void
  event: any // Pass the full event object
}

export function RSVPSuccessModal({ open, onClose, event }: RSVPSuccessModalProps) {
  React.useEffect(() => {
    if (open) {
      // Fire confetti when it opens
      const duration = 3 * 1000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#025c48", "#95fde2", "#ffb703"]
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#025c48", "#95fde2", "#ffb703"]
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [open])

  if (!event) return null

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard.writeText(`I'm going to ${event.title}! Join me: ${url}`)
    toast.success("Link copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/50 gap-0">
        <DialogTitle className="sr-only">RSVP Confirmed</DialogTitle>
        <DialogDescription className="sr-only">Your spot for the event has been confirmed.</DialogDescription>

        {/* Header Image */}
        <div className="w-full h-48 sm:h-64 relative bg-muted">
          {event.cover_image_url ? (
            <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand-dark/40 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-brand/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
        </div>

        <div className="px-6 pb-8 pt-2 -mt-12 relative z-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4 border-4 border-background shadow-lg">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">You're in!</h2>
          <p className="text-muted-foreground mb-6">
            Your spot for <strong className="text-foreground">{event.title}</strong> has been confirmed.
          </p>

          <div className="w-full bg-foreground/5 rounded-2xl p-4 mb-8 text-left space-y-3">
            <div className="flex items-start gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5 mt-0.5 text-brand" />
              <div>
                <div className="font-medium text-foreground">Date & Time</div>
                <div className="text-sm">{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</div>
                <div className="text-sm">{format(new Date(event.event_date), 'h:mm a')}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground pt-3 border-t border-border/50">
              <MapPin className="w-5 h-5 mt-0.5 text-brand" />
              <div>
                <div className="font-medium text-foreground">Location</div>
                <div className="text-sm">{event.location || 'TBA'}</div>
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            variant="default"
            className="w-full h-14 rounded-xl text-lg font-bold"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 mr-2" /> Share with friends
          </Button>
          <Button variant="ghost" onClick={onClose} className="mt-2 text-muted-foreground">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
