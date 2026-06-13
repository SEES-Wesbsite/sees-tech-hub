'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const track = formData.get('track') as string
  const academicYear = formData.get('academicYear') as string
  const githubUrl = formData.get('githubUrl') as string | null
  const skillsRaw = formData.get('skills') as string | null

  if (!track || !academicYear) {
    return { error: 'Track and academic year are required.' }
  }

  const skills = skillsRaw
    ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : null

  const { error } = await supabase
    .from('users')
    .update({
      track,
      academic_year: academicYear,
      github_url: githubUrl || null,
      skills,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function submitTaskProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const taskId = formData.get('taskId') as string
  const proofUrl = formData.get('proofUrl') as string

  if (!taskId || !proofUrl) {
    return { error: 'Task ID and proof URL are required.' }
  }

  // Check for duplicate submission
  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_id', taskId)
    .maybeSingle()

  if (existing) {
    return { error: 'You have already submitted proof for this task.' }
  }

  const { error } = await supabase
    .from('submissions')
    .insert({
      user_id: user.id,
      task_id: taskId,
      proof_url: proofUrl,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tasks', 'page')
  return { success: true }
}
