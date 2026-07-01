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

  // Determine schema type
  const isEvent = opportunity.opportunity_type === 'event' || opportunity.opportunity_type === 'hackathon';
  const schemaType = isEvent ? 'Event' : 'JobPosting';
  const schemaData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "title": opportunity.title,
    "description": opportunity.summary,
    "datePosted": opportunity.published_at || opportunity.created_at,
    "hiringOrganization": {
      "@type": "Organization",
      "name": opportunity.organization,
      "logo": "https://tech.seesunilag.com/logo-mark.svg"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": opportunity.location || "Lagos",
        "addressRegion": "LA",
        "addressCountry": "NG"
      }
    },
    "employmentType": opportunity.opportunity_type === 'internship' ? 'INTERN' : 'OTHER',
    "baseSalary": opportunity.compensation ? {
      "@type": "MonetaryAmount",
      "currency": "NGN",
      "value": {
        "@type": "QuantitativeValue",
        "value": opportunity.compensation,
        "unitText": "YEAR"
      }
    } : undefined,
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <OpportunityDetailClient 
        opportunity={opportunity as Opportunity} 
        initialIsSaved={isSaved} 
      />
    </div>
  )
}
