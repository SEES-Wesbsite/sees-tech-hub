'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { profileSchema, type ProfileFormState } from '@/lib/profile-validation';

export async function saveProfile(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const result = profileSchema.safeParse({
    full_name: formData.get('full_name'),
    preferred_name: formData.get('preferred_name'),
    primary_stacks: String(formData.get('primary_stacks') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    github_url: formData.get('github_url'),
    portfolio_link: formData.get('portfolio_link'),
    social_link: formData.get('social_link'),
  });
  if (!result.success) return { error: result.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const input = result.data;
  const { data, error } = await supabase.from('users').update({
    ...input,
    github_url: input.github_url || null,
    portfolio_link: input.portfolio_link || null,
    social_link: input.social_link || null,
    onboarding_status: 'completed',
  }).eq('id', user.id).select('id').single();
  if (error || !data) return { error: 'Your profile could not be saved. Please try again.' };
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  revalidatePath('/u/[username]', 'page');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Could not sign out. Please try again.');
  redirect('/login');
}
