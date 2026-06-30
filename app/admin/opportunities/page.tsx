import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OpportunitiesAdminClient } from './opportunities-admin-client'

export const metadata = {
  title: 'Manage Opportunities | SEES Tech Hub',
}

export default async function AdminOpportunitiesPage() {
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

  // Fetch all opportunities
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch interactions to calculate CTR
  // In a production app with millions of interactions, this would be an RPC call or materialized view.
  // For MVP, we fetch counts grouped by opportunity_id.
  const { data: interactions } = await supabase
    .from('opportunity_interactions')
    .select('opportunity_id, interaction_type')

  const statsMap = new Map()
  
  if (interactions) {
    interactions.forEach(interaction => {
      const stats = statsMap.get(interaction.opportunity_id) || { views: 0, saves: 0, clicks: 0 }
      if (interaction.interaction_type === 'view') stats.views++
      if (interaction.interaction_type === 'save') stats.saves++
      if (interaction.interaction_type === 'click_apply') stats.clicks++
      statsMap.set(interaction.opportunity_id, stats)
    })
  }

  const enrichedOpportunities = (opportunities || []).map(opp => ({
    ...opp,
    stats: statsMap.get(opp.id) || { views: 0, saves: 0, clicks: 0 }
  }))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Review scraped and community-submitted opportunities, approve them, and manage the feed.
        </p>
      </div>

      <OpportunitiesAdminClient initialOpportunities={enrichedOpportunities} />
    </div>
  )
}
