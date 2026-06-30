'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Opportunity } from '@/lib/types'
import { changeOpportunityStatus, batchApproveOpportunities, triggerScraper } from '@/app/actions/admin-opportunities'
import { EditOpportunityDrawer } from './edit-opportunity-drawer'
import { Loader } from '@/components/ui/loader'
import { Check, X, Edit, Trash2, Bot, Plus, Eye, Bookmark, MousePointerClick, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type EnrichedOpportunity = Opportunity & {
  stats: { views: number; saves: number; clicks: number }
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-success/10 text-success border-success/20',
  pending_review: 'bg-warning/10 text-warning border-warning/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  archived: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-muted text-muted-foreground border-border',
}

export function OpportunitiesAdminClient({
  initialOpportunities,
}: {
  initialOpportunities: EnrichedOpportunity[]
}) {
  const [opportunities, setOpportunities] = useState<EnrichedOpportunity[]>(initialOpportunities)
  const [isPending, startTransition] = useTransition()
  const [isScraping, setIsScraping] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  
  const [editingOpp, setEditingOpp] = useState<EnrichedOpportunity | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const pendingCount = opportunities.filter(o => o.status === 'pending_review').length
  const approvedCount = opportunities.filter(o => o.status === 'approved').length
  const totalViews = opportunities.reduce((sum, o) => sum + o.stats.views, 0)
  const totalClicks = opportunities.reduce((sum, o) => sum + o.stats.clicks, 0)

  const filteredOpportunities = filter === 'all' 
    ? opportunities 
    : opportunities.filter(o => o.status === filter)

  const handleStatusChange = (id: string, status: 'approved' | 'rejected' | 'archived') => {
    startTransition(async () => {
      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      await changeOpportunityStatus(id, status)
    })
  }

  const handleBatchApprove = () => {
    const pendingIds = opportunities.filter(o => o.status === 'pending_review').map(o => o.id)
    if (pendingIds.length === 0) return

    startTransition(async () => {
      setOpportunities(prev => prev.map(o => o.status === 'pending_review' ? { ...o, status: 'approved' } : o))
      await batchApproveOpportunities(pendingIds)
    })
  }

  const handleTriggerScraper = async () => {
    setIsScraping(true)
    const res = await triggerScraper()
    setIsScraping(false)
    // Reload if successful to show the new entries
    if (!res.error) {
      window.location.reload()
    }
  }

  const openEditDrawer = (opp: EnrichedOpportunity | null) => {
    setEditingOpp(opp)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending Review</p>
            <p className="text-3xl font-serif font-bold text-warning">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Live</p>
            <p className="text-3xl font-serif font-bold text-success">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Views</p>
            <p className="text-3xl font-serif font-bold text-foreground">{totalViews}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Clicks</p>
            <p className="text-3xl font-serif font-bold text-foreground">{totalClicks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending_review', 'approved', 'rejected', 'archived'].map(status => (
            <Badge
              key={status}
              variant={filter === status ? 'default' : 'secondary'}
              className="cursor-pointer text-sm py-1.5 px-4 rounded-full capitalize"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerScraper}
            disabled={isScraping}
            className="gap-2 px-4 py-2"
          >
            {isScraping ? <Loader className="w-4 h-4" variant="simple-spin" /> : <Bot className="w-4 h-4" />}
            Scrape New
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDrawer(null)}
            className="gap-2 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </Button>
          {pendingCount > 0 && (
            <Button
              size="sm"
              onClick={handleBatchApprove}
              disabled={isPending}
              className="gap-2 px-4 py-2"
            >
              <Check className="w-4 h-4" />
              Approve All ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Listing */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No opportunities match this filter.</p>
          </div>
        ) : (
          filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="border-border hover:border-brand/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold text-lg text-foreground truncate">{opp.title}</h3>
                      <Badge variant="outline" className={STATUS_STYLES[opp.status] || ''}>
                        {opp.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {opp.opportunity_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {opp.organization} • {opp.location_type}{opp.location ? ` (${opp.location})` : ''}
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-2">{opp.summary}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-5 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {opp.stats.views} views
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5" />
                        {opp.stats.saves} saves
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        {opp.stats.clicks} clicks
                        <span className="text-brand font-medium">
                          ({opp.stats.views > 0 ? Math.round((opp.stats.clicks / opp.stats.views) * 100) : 0}% CTR)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col justify-end gap-2 shrink-0">
                    {opp.status === 'pending_review' && (
                      <>
                        <Button size="sm" onClick={() => handleStatusChange(opp.id, 'approved')} disabled={isPending} className="gap-1.5 px-3">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(opp.id, 'rejected')} disabled={isPending} className="gap-1.5 px-3">
                          <X className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEditDrawer(opp)} className="gap-1.5 px-3">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                    {opp.status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(opp.id, 'archived')} disabled={isPending} className="gap-1.5 px-3">
                        <Trash2 className="w-3.5 h-3.5" /> Archive
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EditOpportunityDrawer 
        opportunity={editingOpp} 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />
    </div>
  )
}
