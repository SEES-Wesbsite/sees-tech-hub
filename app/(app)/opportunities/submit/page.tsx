import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmitOpportunityClient } from './submit-client'

export const metadata = {
  title: 'Submit Opportunity | SEES Tech Hub',
  description: 'Submit an internship, job, or hackathon to the SEES community.',
}

export default async function SubmitOpportunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/opportunities/submit')
  }

  return (
    <main className="container max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-8">
      <SubmitOpportunityClient />
    </main>
  )
}
