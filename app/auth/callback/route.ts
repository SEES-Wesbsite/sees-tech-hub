import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Get the proper origin from headers (crucial for Netlify/Vercel edge proxies)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https'
  
  let origin = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : forwardedHost 
      ? `${protocol}://${forwardedHost}` 
      : host 
        ? `${protocol}://${host}`
        : requestUrl.origin
      
  // Ensure origin doesn't end with slash
  origin = origin.replace(/\/$/, '')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      // Check if they have a public.users profile
      const { data: profile } = await supabase
        .from('users')
        .select('id, onboarding_status')
        .eq('id', session.user.id)
        .single()
        
      if (!profile || profile.onboarding_status !== 'completed') {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
