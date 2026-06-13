'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { Trophy, Search, Medal, Shield, Swords, Sparkles, Code2 } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { getTier } from '@/lib/types'

export function LeaderboardClient({ initialUsers, currentUserId }: { initialUsers: Profile[], currentUserId: string }) {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: users } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100)
      return (data ?? []) as Profile[]
    },
    initialData: initialUsers,
    refetchInterval: 30000, // Background poll every 30s so the board stays live during events
  })

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.matric_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Medal className="w-6 h-6 text-warning drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
    if (index === 1) return <Medal className="w-6 h-6 text-muted-foreground drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />
    if (index === 2) return <Medal className="w-6 h-6 text-destructive drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
    return <span className="text-muted-foreground font-bold text-lg w-6 text-center">{index + 1}</span>
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 mb-4 shadow-[0_0_20px_rgba(149,253,226,0.1)]">
            <Trophy className="w-6 h-6 text-brand" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">Top 100 builders in SEES Tech Hub.</p>
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search builders..."
            className="block w-full rounded-full border-0 py-2.5 pl-10 pr-4 text-sm text-foreground bg-input/50 ring-1 ring-inset ring-border focus:ring-2 focus:ring-brand transition-all"
          />
        </div>
      </motion.div>

      {/* Board */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground w-16 text-center">Rank</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Builder</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Track</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Tier</th>
                <th className="px-6 py-4 text-sm font-semibold text-brand text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No builders found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const isMe = user.id === currentUserId
                  const tier = getTier(user.total_points)

                  return (
                    <motion.tr 
                      variants={itemVariants}
                      key={user.id} 
                      className={`border-b border-border/50 transition-colors hover:bg-muted/10 ${isMe ? 'bg-brand/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex justify-center">{getRankIcon(index)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-brand text-black ring-2 ring-brand ring-offset-2 ring-offset-background' : 'bg-input text-muted-foreground'}`}>
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-2">
                              {user.full_name}
                              {isMe && <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-black bg-brand text-black">You</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.matric_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {user.track ? (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {user.track === 'software' && <Code2 className="w-3.5 h-3.5" />}
                            {user.track === 'cybersecurity' && <Shield className="w-3.5 h-3.5" />}
                            {user.track === 'ai_ml' && <Sparkles className="w-3.5 h-3.5" />}
                            {user.track === 'embedded_systems' && <Swords className="w-3.5 h-3.5" />}
                            <span className="capitalize">{user.track.replace('_', ' ')}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold border" style={{ color: tier.color, borderColor: `${tier.color}40`, backgroundColor: `${tier.color}15` }}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-lg font-mono text-foreground">{user.total_points}</span>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
