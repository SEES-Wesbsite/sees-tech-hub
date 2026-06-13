import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial profile server-side for zero-layout-shift hydration
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </div>
        <h1 className="text-3xl font-bold">Corrupted Profile State</h1>
        <p className="text-muted-foreground max-w-md">
          It looks like you manually created an auth user in the Supabase dashboard without creating a corresponding <code>public.users</code> record. 
        </p>
        <p className="text-sm text-muted-foreground">Please sign out and use the proper Signup flow.</p>
        
        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/signup')
        }}>
          <button type="submit" className="mt-4 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity">
            Sign Out &amp; Fix
          </button>
        </form>
      </div>
    )
  }

  return <DashboardClient initialProfile={profile} />
}
