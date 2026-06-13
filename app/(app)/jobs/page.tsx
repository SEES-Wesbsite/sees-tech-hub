import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobsClient } from './jobs-client'
import type { Job } from '@/lib/types'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return <JobsClient initialJobs={(jobs ?? []) as Job[]} />
}
