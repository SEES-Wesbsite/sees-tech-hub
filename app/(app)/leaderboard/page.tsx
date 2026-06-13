import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeaderboardClient } from './leaderboard-client'
import type { Profile } from '@/lib/types'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the top 100 users ordered by points
  const { data: topUsers } = await supabase
    .from('users')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(100)

  return <LeaderboardClient initialUsers={(topUsers ?? []) as Profile[]} currentUserId={user.id} />
}
