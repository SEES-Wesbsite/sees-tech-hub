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

  const preferredName = formData.get('preferredName') as string
  const knownSkills = formData.get('knownSkills') as string | null
  const learningSkills = formData.get('learningSkills') as string | null
  const portfolioLink = formData.get('portfolioLink') as string | null
  const socialLink = formData.get('socialLink') as string | null

  if (!preferredName) {
    return { error: 'Preferred name is required.' }
  }

  const knownSkillsArr = knownSkills ? JSON.parse(knownSkills) : []
  const learningSkillsArr = learningSkills ? JSON.parse(learningSkills) : []

  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || preferredName,
      preferred_name: preferredName,
      known_skills: knownSkillsArr,
      learning_skills: learningSkillsArr,
      portfolio_link: portfolioLink || null,
      social_link: socialLink || null,
    })

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
