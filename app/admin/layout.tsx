import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, LayoutDashboard, CheckSquare, Link as LinkIcon, FilePlus, ArrowLeft } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify Admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-destructive" />
            <span className="font-bold text-xl tracking-tight text-foreground">Admin Hub</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Analytics
          </Link>
          <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <CheckSquare className="w-5 h-5" /> Submissions
          </Link>
          <Link href="/admin/links" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <LinkIcon className="w-5 h-5" /> Short Links
          </Link>
          <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <FilePlus className="w-5 h-5" /> Content Engine
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Mobile Nav for Admins */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe flex items-center justify-around px-2 py-2">
        <Link href="/admin/dashboard" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Analytics</span>
        </Link>
        <Link href="/admin/submissions" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Queue</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Exit</span>
        </Link>
      </nav>
    </div>
  )
}
