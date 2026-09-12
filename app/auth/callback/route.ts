import { createClient } from '@/lib/supabase/server';
import { callbackOrigin } from '@/lib/auth-redirect';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = callbackOrigin(request.url, process.env.NEXT_PUBLIC_SITE_URL);
  const code = requestUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=authentication', origin));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL('/login?error=authentication', origin));
  }
  // The destination page handles profile loading and onboarding once.
  return NextResponse.redirect(new URL('/dashboard', origin));
}
