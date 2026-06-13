'use client'

import { motion } from 'motion/react'
import { Users, CheckSquare, ListTodo, Activity } from 'lucide-react'

type Stats = {
  totalUsers: number
  pendingSubmissions: number
  totalTasks: number
}

type RecentUser = {
  id: string
  full_name: string
  track: string | null
  created_at: string
}

export function AdminDashboardClient({ stats, recentUsers }: { stats: Stats, recentUsers: RecentUser[] }) {
  
  const statCards = [
    { label: 'Total Members', value: stats.totalUsers, icon: Users, color: 'text-brand' },
    { label: 'Pending Reviews', value: stats.pendingSubmissions, icon: CheckSquare, color: 'text-warning' },
    { label: 'Total Tasks Created', value: stats.totalTasks, icon: ListTodo, color: 'text-info' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand" />
          Platform Overview
        </h1>
        <p className="text-muted-foreground mt-1">High-level metrics for SEES Tech Hub.</p>
      </motion.div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4 relative overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-input/50 shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-3xl overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Recent Registrations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/20">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Builder</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Track</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm text-foreground">{user.full_name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{user.track ? user.track.replace('_', ' ') : 'Pending...'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground text-right">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
