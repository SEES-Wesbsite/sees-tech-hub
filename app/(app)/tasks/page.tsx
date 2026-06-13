import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TasksClient } from './tasks-client'
import type { Task, Submission } from '@/lib/types'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active tasks and user's submissions in parallel — SSR for instant paint
  const [tasksRes, submissionsRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id),
  ])

  return (
    <TasksClient
      initialTasks={(tasksRes.data ?? []) as Task[]}
      initialSubmissions={(submissionsRes.data ?? []) as Submission[]}
      userId={user.id}
    />
  )
}
