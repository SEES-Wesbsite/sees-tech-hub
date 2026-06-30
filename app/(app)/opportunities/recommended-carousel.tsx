'use client'

import { useRef, useState, useEffect } from 'react'
import { Opportunity } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Bookmark, BookmarkCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { trackInteraction, removeSave } from '@/app/actions/user-opportunities'

interface Props {
  recommendations: Opportunity[]
  savedIds: Set<string>
  onToggleSave: (oppId: string, e: React.MouseEvent) => void
}

export function RecommendedCarousel({ recommendations, savedIds, onToggleSave }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  const formatDeadline = (dateString: string | null) => {
    if (!dateString) return 'Rolling / Unspecified'
    const d = new Date(dateString)
    
    if (!mounted) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    if (diffDays < 0) return 'Closed'
    if (diffDays === 0) return 'Closes Today'
    if (diffDays <= 7) return `Closes in ${diffDays} days`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  if (recommendations.length === 0) return null

  return (
    <div className="space-y-4 mb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-brand" />
          </div>
          <h2 className="text-xl font-serif font-bold">Recommended For You</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8 rounded-full">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map(opp => (
          <Link key={`rec-${opp.id}`} href={`/opportunities/${opp.id}`} className="shrink-0 w-[300px] md:w-[380px] snap-start">
            <Card className="h-full flex flex-col hover:border-brand/50 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-b from-card to-card/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-brand uppercase tracking-wider">{opp.organization}</p>
                    <CardTitle className="text-lg leading-tight font-serif group-hover:text-brand transition-colors line-clamp-2">
                      {opp.title}
                    </CardTitle>
                  </div>
                  <button 
                    onClick={(e) => onToggleSave(opp.id, e)}
                    className="text-muted-foreground hover:text-foreground shrink-0 z-10"
                  >
                    {savedIds.has(opp.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-brand fill-brand/20" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {opp.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] bg-brand/5 text-brand border-brand/10">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {opp.opportunity_type}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="capitalize">{opp.location_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={formatDeadline(opp.deadline).includes('Close') ? 'text-destructive font-medium' : ''}>
                      {formatDeadline(opp.deadline)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
