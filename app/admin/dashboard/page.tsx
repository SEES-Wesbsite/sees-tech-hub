import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './admin-dashboard-client'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch parallel analytics using raw counts
  const [
    { count: totalUsers },
    { count: pendingSubmissions },
    { count: totalTasks },
    { data: recentUsers }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('id, full_name, track, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  return (
    <AdminDashboardClient 
      stats={{
        totalUsers: totalUsers ?? 0,
        pendingSubmissions: pendingSubmissions ?? 0,
        totalTasks: totalTasks ?? 0,
      }}
      recentUsers={recentUsers ?? []}
    />
  )
}
