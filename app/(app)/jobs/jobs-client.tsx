'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { Briefcase, Building2, ExternalLink } from 'lucide-react'
import type { Job } from '@/lib/types'

export function JobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const supabase = createClient()

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return (data ?? []) as Job[]
    },
    initialData: initialJobs,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-brand" />
          Job Board
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Curated internships and junior roles for STH verified members.</p>
      </motion.div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <p className="text-lg font-medium text-muted-foreground">No active job postings right now.</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {jobs.map(job => (
            <motion.div 
              key={job.id}
              variants={itemVariants}
              className="bg-card border border-border rounded-3xl p-6 flex flex-col h-full relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-4 relative">
                <div className="w-12 h-12 rounded-xl bg-input flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                  <p className="text-sm font-semibold text-brand">{job.company}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-8 flex-1 relative">{job.description}</p>

              <div className="mt-auto relative">
                <a 
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors"
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
