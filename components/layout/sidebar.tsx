'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { LayoutDashboard, CheckSquare, Trophy, Calendar, FolderGit2, Briefcase, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Bounties & DSA', icon: CheckSquare },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar h-full">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-black font-bold text-lg leading-none">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-sidebar-foreground">STH.</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-black bg-brand' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-sidebar-foreground/50'}`} />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link href="/settings">
          <motion.div
            whileHover={{ x: 4 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/settings')
                ? 'text-black bg-brand'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </motion.div>
        </Link>
      </div>
    </aside>
  )
}
