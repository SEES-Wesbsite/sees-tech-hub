import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      // Check if they have a public.users profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()
        
      if (!profile) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
