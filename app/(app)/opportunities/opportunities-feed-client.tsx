'use client'

import { useState, useMemo, useEffect } from 'react'
import { Opportunity } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import Link from 'next/link'
import { trackInteraction, removeSave } from '@/app/actions/user-opportunities'
import { useRouter } from 'next/navigation'
import { RecommendedCarousel } from './recommended-carousel'

interface Props {
  initialOpportunities: Opportunity[]
  initialSavedIds: string[]
  recommendations?: Opportunity[]
}

const CATEGORIES = ['All', 'hackathon', 'internship', 'job', 'scholarship', 'event', 'other']

export function OpportunitiesFeedClient({ initialOpportunities, initialSavedIds, recommendations = [] }: Props) {
  const router = useRouter()
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds))
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredOpportunities = useMemo(() => {
    let filtered = initialOpportunities
    if (activeCategory !== 'All') {
      filtered = filtered.filter(o => o.opportunity_type === activeCategory)
    }
    return filtered
  }, [initialOpportunities, activeCategory])

  const setCategory = (category: string) => {
    setActiveCategory(category)
  }

  const toggleSave = async (oppId: string, e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating if wrapped in a link
    e.stopPropagation()

    const isSaved = savedIds.has(oppId)
    
    // Optimistic UI update
    setSavedIds(prev => {
      const next = new Set(prev)
      if (isSaved) next.delete(oppId)
      else next.add(oppId)
      return next
    })

    if (isSaved) {
      await removeSave(oppId)
    } else {
      await trackInteraction(oppId, 'save')
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

  return (
    <div className="space-y-8">
      {/* Recommended Carousel */}
      <RecommendedCarousel 
        recommendations={recommendations} 
        savedIds={savedIds} 
        onToggleSave={toggleSave} 
      />

      <div className="space-y-4">
        <div className="h-px w-full bg-border my-8" />
        <h3 className="font-serif font-semibold text-lg text-foreground mb-4">Latest Opportunities</h3>
        
        {/* Filters */}
        <div className="flex flex-nowrap overflow-x-auto scrollbar-hide whitespace-nowrap gap-2 pb-2">
          {CATEGORIES.map(cat => (
            <Badge 
              key={cat} 
              variant={activeCategory === cat ? 'default' : 'secondary'}
              className="cursor-pointer text-sm py-1.5 px-4 rounded-full"
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed rounded-xl">
            No opportunities found for this category.
          </div>
        ) : (
          filteredOpportunities.map(opp => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`}>
              <Card className="h-full flex flex-col hover:border-brand/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-brand uppercase tracking-wider">{opp.organization}</p>
                      <CardTitle className="text-lg leading-tight font-serif group-hover:text-brand transition-colors">
                        {opp.title}
                      </CardTitle>
                    </div>
                    <button 
                      onClick={(e) => toggleSave(opp.id, e)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
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
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {opp.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {opp.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                    {opp.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-muted/50">+{opp.tags.length - 3}</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="capitalize">{opp.location_type}</span>
                      {opp.location && <span>• {opp.location}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className={formatDeadline(opp.deadline).includes('Close') ? 'text-warning font-medium' : ''}>
                        {formatDeadline(opp.deadline)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
