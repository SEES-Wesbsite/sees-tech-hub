import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginClient from './login-client';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');
  const params = await searchParams;
  return <LoginClient authenticationError={params.error === 'authentication'} />;
}
