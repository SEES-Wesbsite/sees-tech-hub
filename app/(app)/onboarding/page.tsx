import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingClient } from './onboarding-client'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user already completed onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('track, academic_year, full_name')
    .eq('id', user.id)
    .single()

  // If they already have a track, skip onboarding
  if (profile?.track && profile?.academic_year) {
    redirect('/dashboard')
  }

  return <OnboardingClient userName={profile?.full_name ?? 'Builder'} />
}
