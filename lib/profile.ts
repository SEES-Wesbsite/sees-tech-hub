import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const PROFILE_COLUMNS = 'id,full_name,preferred_name,avatar_url,github_url,primary_stacks,portfolio_link,social_link,onboarding_status' as const;

// Request-scoped memoization shares authentication/profile reads between pages.
export const getOwnProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');
  const { data: profile, error } = await supabase.from('users')
    .select(PROFILE_COLUMNS).eq('id', user.id).single();
  if (error || !profile) throw new Error('Your profile could not be loaded. Please try again.');
  return profile;
});

export async function requireCompletedProfile() {
  const profile = await getOwnProfile();
  if (profile.onboarding_status !== 'completed') redirect('/onboarding');
  return profile;
}
