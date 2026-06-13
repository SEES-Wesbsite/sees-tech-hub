'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'admin') throw new Error('Unauthorized')
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const taskType = formData.get('taskType') as string
    const pointValue = parseInt(formData.get('pointValue') as string, 10)
    const deadlineStr = formData.get('deadline') as string
    
    const { error } = await supabase.from('tasks').insert({
      title,
      description,
      task_type: taskType,
      point_value: pointValue,
      deadline: deadlineStr ? new Date(deadlineStr).toISOString() : null,
    })
    
    if (error) throw error
    revalidatePath('/tasks', 'page')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const eventDateStr = formData.get('eventDate') as string
    const pointsAwarded = parseInt(formData.get('pointsAwarded') as string, 10)
    
    const { error } = await supabase.from('events').insert({
      title,
      description,
      location,
      event_date: new Date(eventDateStr).toISOString(),
      points_awarded: pointsAwarded || 0,
    })
    
    if (error) throw error
    revalidatePath('/events', 'page')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const skillsRaw = formData.get('skills') as string
    
    const requiredSkills = skillsRaw 
      ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : []
    
    const { error } = await supabase.from('projects').insert({
      title,
      description,
      required_skills: requiredSkills,
    })
    
    if (error) throw error
    revalidatePath('/projects', 'page')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}

export async function createJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const title = formData.get('title') as string
    const company = formData.get('company') as string
    const description = formData.get('description') as string
    const applyUrl = formData.get('applyUrl') as string
    
    const { error } = await supabase.from('jobs').insert({
      title,
      company,
      description,
      apply_url: applyUrl,
    })
    
    if (error) throw error
    revalidatePath('/jobs', 'page')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}
