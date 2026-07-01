import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, LayoutDashboard, Link as LinkIcon, ArrowLeft, CalendarDays, Briefcase, Activity } from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar'

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
    <SidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        {/* Admin Sidebar */}
        <Sidebar className="hidden md:flex border-r border-border bg-card/50">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-destructive" />
              <span className="font-serif font-semibold text-xl tracking-tight text-foreground">Admin Hub</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu className="gap-2 px-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="mb-4">
                    <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/dashboard" className="text-foreground font-medium">
                      <Activity className="w-5 h-5 mr-2" /> Overview
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/events" className="text-foreground font-medium">
                      <CalendarDays className="w-5 h-5 mr-2" /> Events & Claims
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/quests" className="text-foreground font-medium">
                      <LayoutDashboard className="w-5 h-5 mr-2" /> Quests & Bounties
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/links" className="text-foreground font-medium">
                      <LinkIcon className="w-5 h-5 mr-2" /> Short Links
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/opportunities" className="text-foreground font-medium">
                      <Briefcase className="w-5 h-5 mr-2" /> Opportunities
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative w-full h-full">
          <div className="h-full w-full p-4 md:p-8 pt-12 md:pt-8 relative">
            <div className="hidden md:block absolute top-4 left-4 z-10">
              <SidebarTrigger />
            </div>
            <div className="md:pl-12">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Nav for Admins */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe flex items-center justify-around px-2 py-2">
          <Link href="/admin/dashboard" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Overview</span>
          </Link>
          <Link href="/admin/events" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Events</span>
          </Link>
          <Link href="/admin/quests" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Quests</span>
          </Link>
          <Link href="/admin/links" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
            <LinkIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Links</span>
          </Link>
          <Link href="/admin/opportunities" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Jobs</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Exit</span>
          </Link>
        </nav>
      </div>
    </SidebarProvider>
  )
}
