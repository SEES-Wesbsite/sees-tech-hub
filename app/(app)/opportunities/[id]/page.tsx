import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OpportunityDetailClient } from './opportunity-detail-client'
import { Opportunity } from '@/lib/types'

import { Metadata } from 'next'

// We will use generateMetadata instead of static metadata

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('title, summary')
    .eq('id', id)
    .single()

  if (!opportunity) {
    return {
      title: 'Opportunity Not Found',
    }
  }

  return {
    title: `${opportunity.title} | SEES Tech Hub`,
    description: opportunity.summary,
    openGraph: {
      title: opportunity.title,
      description: opportunity.summary,
      images: [`/api/og/opportunity?id=${id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: opportunity.title,
      description: opportunity.summary,
      images: [`/api/og/opportunity?id=${id}`],
    },
  }
}

export default async function OpportunityDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch opportunity
  const { data: opportunity, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !opportunity) {
    notFound()
  }

  // If not approved and user is not admin, deny access
  if (opportunity.status !== 'approved') {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
    if (profile?.role !== 'admin') {
      notFound()
    }
  }

  // Track view (if logged in, or anonymous if we wanted to).
  // Doing it server side is tricky with Next.js caching, but we'll do it client side for precision.

  // Fetch user saves
  let isSaved = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: save } = await supabase
      .from('opportunity_interactions')
      .select('id')
      .eq('opportunity_id', id)
      .eq('user_id', user.id)
      .eq('interaction_type', 'save')
      .single()
    
    if (save) isSaved = true
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <OpportunityDetailClient 
        opportunity={opportunity as Opportunity} 
        initialIsSaved={isSaved} 
      />
    </div>
  )
}
