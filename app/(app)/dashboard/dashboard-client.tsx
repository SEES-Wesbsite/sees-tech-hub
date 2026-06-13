'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions/auth'
import { motion } from 'motion/react'
import { AlertCircle, LogOut } from 'lucide-react'

// Define the shape of our profile data
type Profile = {
  id: string
  full_name: string
  matric_number: string
  total_points: number
  verification_status: string
}

export function DashboardClient({ initialProfile }: { initialProfile: Profile }) {
  const supabase = createClient()

  // React Query Hook for background polling and optimistic UI
  const { data: profile } = useQuery({
    queryKey: ['profile', initialProfile.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', initialProfile.id)
        .single()
      return data as Profile
    },
    initialData: initialProfile,
  })

  // Calculate Tier
  const tier = profile.total_points >= 600 ? 'Pioneer' : 
               profile.total_points >= 300 ? 'Innovator' : 
               profile.total_points >= 100 ? 'Builder' : 'Explorer'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex items-center justify-between">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {profile.full_name}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Matric: {profile.matric_number}</p>
        </motion.div>
        
        <motion.form variants={itemVariants} action={logout} className="hidden md:block">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold hover:bg-card/80 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </motion.form>
      </motion.div>

      {profile.verification_status !== 'verified' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-warning/10 border border-warning/20 p-5 rounded-2xl flex items-start gap-4"
        >
          <AlertCircle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="text-warning font-bold text-lg">Verification Pending</h3>
            <p className="text-sm text-warning/80 mt-1">
              Your biodata is currently being reviewed by our AI system. You cannot earn points or claim bounties until verified.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-card p-6 rounded-3xl border border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-bold text-muted-foreground mb-2">Total Points</h3>
          <p className="text-5xl font-black text-brand tracking-tighter">{profile.total_points}</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-card p-6 rounded-3xl border border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-bold text-muted-foreground mb-2">Current Tier</h3>
          <p className="text-3xl font-bold text-foreground">{tier}</p>
          <div className="mt-4 w-full h-2 bg-input rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min((profile.total_points % 100) / 100 * 100, 100)}%` }} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">Next tier at {Math.ceil((profile.total_points + 1) / 100) * 100} pts</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
