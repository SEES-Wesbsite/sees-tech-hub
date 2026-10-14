import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const getExecutiveAccess = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await supabase.from('executive_access').select('role').eq('user_id', user.id).maybeSingle();
  if (error) throw new Error('Executive access could not be checked. Please try again.');
  return { supabase, user, role: data?.role ?? null };
});
export async function requireExecutive(ownerOnly = false) {
  const access = await getExecutiveAccess();
  if (!access.role || (ownerOnly && access.role !== 'super_admin')) redirect('/dashboard');
  return access;
}
