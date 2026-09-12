import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCompletedProfile } from '@/lib/profile';
import { ProfileCard } from '@/components/profile-card';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  await requireCompletedProfile();
  const { username } = await params;
  const supabase = await createClient();
  const columns = 'full_name,preferred_name,avatar_url,primary_stacks,github_url,portfolio_link,social_link' as const;
  // New links use stable user IDs; existing name-based links still resolve.
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
  const name = username.replace(/-/g, ' ');
  // Escape LIKE metacharacters so a name cannot become a wildcard lookup.
  const pattern = name.replace(/[\\%_]/g, '\\$&');
  const first = isId
    ? await supabase.from('users').select(columns).eq('id', username).maybeSingle()
    : await supabase.from('users').select(columns).ilike('preferred_name', pattern).maybeSingle();
  if (first.error) throw new Error('This profile could not be loaded.');
  let profile = first.data;
  if (!profile && !isId) {
    const fallback = await supabase.from('users').select(columns).ilike('full_name', pattern).maybeSingle();
    if (fallback.error) throw new Error('This profile could not be loaded.');
    profile = fallback.data;
  }
  if (!profile) notFound();
  return <ProfileCard profile={profile} />;
}
