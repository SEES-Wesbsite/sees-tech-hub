'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'

// Generate synthetic email from matric number
export function getSyntheticEmail(matricNumber: string) {
  return `${matricNumber.trim().toLowerCase()}@student.unilag.edu.ng`
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const matric = formData.get('matric') as string
  const pin = formData.get('pin') as string

  if (!matric || !pin) {
    return { error: 'Matric number and PIN are required' }
  }

  const syntheticEmail = getSyntheticEmail(matric)

  const { error } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: pin,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const matric = formData.get('matric') as string
  const pin = formData.get('pin') as string
  const fullName = formData.get('fullName') as string
  const contactEmail = formData.get('contactEmail') as string

  if (!matric || !pin || !fullName || !contactEmail) {
    return { error: 'All fields are required' }
  }

  const syntheticEmail = getSyntheticEmail(matric)

  const { data, error } = await supabase.auth.signUp({
    email: syntheticEmail,
    password: pin,
    options: {
      data: {
        full_name: fullName,
        matric_number: matric,
        contact_email: contactEmail,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Insert user profile manually if trigger doesn't exist yet, 
  // though Supabase best practice is to use an auth.users trigger.
  // We'll insert it explicitly here for the MVP.
  
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          matric_number: matric,
          full_name: fullName,
          contact_email: contactEmail,
        }
      ])
      
    if (profileError) {
      // Clean up auth user if profile fails
      const supabaseAdmin = await createAdminClient()
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      return { error: 'Failed to create user profile' }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/setup-profile') // Redirect to complete profile
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
