'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewSubmission(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify Admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const submissionId = formData.get('submissionId') as string
  const status = formData.get('status') as 'approved' | 'rejected'

  if (!submissionId || !status) return { error: 'Missing parameters' }

  // Fetch the submission and the associated task to get point value
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, tasks(point_value, title)')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found' }
  if (submission.status !== 'pending') return { error: 'Submission already reviewed' }

  // Update submission
  const { error: updateError } = await supabase
    .from('submissions')
    .update({ 
      status, 
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', submissionId)

  if (updateError) return { error: updateError.message }

  // If approved, award points
  if (status === 'approved') {
    const pointValue = submission.tasks?.point_value
    const taskTitle = submission.tasks?.title

    if (pointValue) {
      await supabase.from('point_transactions').insert({
        user_id: submission.user_id,
        amount: pointValue,
        reason: `Task Approved: ${taskTitle}`,
        submission_id: submissionId
      })
    }
  }

  revalidatePath('/admin/dashboard', 'layout')
  revalidatePath('/admin/submissions', 'page')
  return { success: true }
}
