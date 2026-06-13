'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { LayoutDashboard, CheckSquare, Trophy, Menu } from 'lucide-react'

// Bottom Nav prioritizes the 4 most important actions. Others can be put in a "Menu" or "More" section.
const BOTTOM_NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/events', label: 'More', icon: Menu }, // Simplified for mobile
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className="w-full">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center py-2"
              >
                <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-colors ${isActive ? 'bg-brand/20' : 'bg-transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
