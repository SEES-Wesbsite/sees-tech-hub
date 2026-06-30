'use client'

import { useState, useEffect, useRef } from 'react'
import { Opportunity } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Clock, Briefcase, Share2, ArrowLeft } from 'lucide-react'
import { trackInteraction, removeSave } from '@/app/actions/user-opportunities'
import { captureAndShare } from '@/lib/utils/share'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  opportunity: Opportunity
  initialIsSaved: boolean
}

export function OpportunityDetailClient({ opportunity, initialIsSaved }: Props) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Track view on mount
  useEffect(() => {
    if (!hasTrackedView) {
      trackInteraction(opportunity.id, 'view')
      setHasTrackedView(true)
    }
  }, [opportunity.id, hasTrackedView])

  const toggleSave = async () => {
    setIsSaved(prev => !prev)
    if (isSaved) {
      await removeSave(opportunity.id)
    } else {
      await trackInteraction(opportunity.id, 'save')
    }
  }

  const handleApplyClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    await trackInteraction(opportunity.id, 'click_apply')
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await captureAndShare(
        shareCardRef.current,
        `SEES-Opportunity-${opportunity.title.replace(/\s+/g, '-').substring(0, 30)}.png`,
        opportunity.title
      )
    } finally {
      setIsSharing(false)
    }
  }

  const getDeadlineInfo = (dateString: string | null) => {
    if (!dateString) return { text: 'Rolling / Unspecified', isUrgent: false, isClosed: false }
    
    const d = new Date(dateString)
    const formatted = d.toLocaleDateString(undefined, { 
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' 
    })

    if (!mounted) {
      return { text: formatted, isUrgent: false, isClosed: false }
    }
    
    const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return { text: 'Closed', isUrgent: true, isClosed: true }
    if (diffDays === 0) return { text: 'Closes Today!', isUrgent: true, isClosed: false }
    if (diffDays <= 3) return { text: `Closes in ${diffDays} days!`, isUrgent: true, isClosed: false }
    
    return { text: formatted, isUrgent: false, isClosed: false }
  }

  const deadlineInfo = getDeadlineInfo(opportunity.deadline)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6 -ml-4">
        <Link href="/opportunities">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunities
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-8" ref={shareCardRef}>
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="outline" className="text-xs uppercase tracking-wider text-brand border-brand/20">
                {opportunity.organization}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {opportunity.opportunity_type}
              </Badge>
              {opportunity.featured && (
                <Badge variant="default" className="bg-warning text-warning-foreground">Featured</Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4 text-foreground">
              {opportunity.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{opportunity.location_type} {opportunity.location ? `• ${opportunity.location}` : ''}</span>
              </div>
              <div className={`flex items-center gap-2 ${deadlineInfo.isUrgent ? 'text-destructive font-medium' : ''}`}>
                <Clock className="w-4 h-4" />
                <span>Deadline: {deadlineInfo.text}</span>
              </div>
              {opportunity.compensation && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{opportunity.compensation}</span>
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-brand">
            <ReactMarkdown>
              {opportunity.description}
            </ReactMarkdown>
          </div>

          <div className="pt-8 border-t border-border">
            <h3 className="font-serif font-semibold text-lg mb-4">Tags & Skills</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Action Card */}
        <div className="w-full md:w-80 shrink-0">
          <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif font-bold text-xl mb-2">Ready to apply?</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your profile and resume are updated before applying.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                asChild 
                className="w-full text-base py-6"
                disabled={deadlineInfo.isClosed}
              >
                <a 
                  href={deadlineInfo.isClosed ? '#' : opportunity.application_url} 
                  target={deadlineInfo.isClosed ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  onClick={deadlineInfo.isClosed ? (e) => e.preventDefault() : handleApplyClick}
                  className={deadlineInfo.isClosed ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {deadlineInfo.isClosed ? 'Application Closed' : 'Apply Now'}
                  {!deadlineInfo.isClosed && <ExternalLink className="w-4 h-4 ml-2" />}
                </a>
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant={isSaved ? "secondary" : "outline"} 
                  className="w-full"
                  onClick={toggleSave}
                >
                  {isSaved ? (
                    <><BookmarkCheck className="w-4 h-4 mr-2 text-brand" /> Saved</>
                  ) : (
                    <><Bookmark className="w-4 h-4 mr-2" /> Save for later</>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0" 
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
