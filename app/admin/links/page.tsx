import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LinksClient } from './links-client';

export default async function AdminLinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile, error: profileError } = await supabase.from('users')
    .select('role').eq('id', user.id).single();
  if (profileError) throw new Error('Could not verify access. Please try again.');
  if (profile?.role !== 'admin') redirect('/dashboard');
  const { data: links, error } = await supabase.from('short_links')
    .select('id,slug,destination_url,description,clicks,created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Could not load short links. Please try again.');
  return <main className="min-h-screen bg-background text-foreground">
    <nav className="mx-auto max-w-6xl px-8 pt-6"><Link href="/dashboard" className="text-brand underline">Back to profile</Link></nav>
    <LinksClient initialLinks={links ?? []} />
  </main>;
}
