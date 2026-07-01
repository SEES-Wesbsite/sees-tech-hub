'use client'

import { useState, useEffect, useRef } from 'react'
import { Opportunity } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Clock, Briefcase, Share2, ArrowLeft } from 'lucide-react'
import { trackInteraction, removeSave } from '@/app/actions/user-opportunities'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
      if (navigator.share) {
        await navigator.share({
          title: opportunity.title,
          text: `Check out this opportunity: ${opportunity.title}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      }
    } catch (e) {
      // Ignore abort errors from native share
      console.error(e)
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
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-brand prose-pre:bg-muted prose-pre:text-foreground prose-strong:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 bg-gradient-to-b from-brand/10 to-transparent border border-brand/20 rounded-2xl p-6 shadow-lg shadow-brand/5 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-2 text-foreground">Ready to apply?</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your profile and resume are updated before submitting your application.
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
              
              <div className="flex justify-center gap-4 w-full mt-4">
                <Button 
                  variant={isSaved ? "secondary" : "outline"} 
                  size="icon"
                  className="w-14 h-14 rounded-2xl"
                  onClick={toggleSave}
                  title={isSaved ? "Saved" : "Save Opportunity"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-6 h-6 text-brand" />
                  ) : (
                    <Bookmark className="w-6 h-6" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-14 h-14 rounded-2xl" 
                  onClick={handleShare}
                  disabled={isSharing}
                  title="Share Opportunity"
                >
                  <Share2 className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
