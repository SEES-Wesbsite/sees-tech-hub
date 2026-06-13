import { createClient } from '@/lib/supabase/server'
import { SubmissionsClient } from './submissions-client'

export default async function AdminSubmissionsPage() {
  const supabase = await createClient()

  // Fetch pending submissions with relations
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id, proof_url, status, submitted_at,
      users ( id, full_name, track ),
      tasks ( id, title, point_value )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  // Format data for client
  const formattedSubmissions = (submissions ?? []).map(sub => ({
    id: sub.id,
    proof_url: sub.proof_url,
    submitted_at: sub.submitted_at,
    // @ts-expect-error - Supabase infers arrays for relations
    user: sub.users ? { full_name: sub.users.full_name, track: sub.users.track } : { full_name: 'Unknown', track: null },
    // @ts-expect-error - Supabase infers arrays for relations
    task: sub.tasks ? { title: sub.tasks.title, points: sub.tasks.point_value } : { title: 'Unknown Task', points: 0 }
  }))

  return <SubmissionsClient initialSubmissions={formattedSubmissions} />
}
