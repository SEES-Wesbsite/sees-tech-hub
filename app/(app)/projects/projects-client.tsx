'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { FolderGit2, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/types'

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const supabase = createClient()

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      return (data ?? []) as Project[]
    },
    initialData: initialProjects,
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
          <FolderGit2 className="w-8 h-8 text-brand" />
          Community Projects
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Build open-source tools for the tech hub and gain real experience.</p>
      </motion.div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <p className="text-lg font-medium text-muted-foreground">No community projects listed yet.</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {projects.map(project => (
            <motion.div 
              key={project.id}
              variants={itemVariants}
              className="bg-card border border-border rounded-3xl p-6 flex flex-col h-full relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              
              <div className="flex items-start justify-between mb-4 relative">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5
                  ${project.status === 'open' ? 'bg-success/10 text-success border-success/20' : 
                    project.status === 'in_progress' ? 'bg-warning/10 text-warning border-warning/20' : 
                    'bg-muted text-muted-foreground border-border'}`}
                >
                  {project.status === 'open' ? <Users className="w-3.5 h-3.5" /> : 
                   project.status === 'in_progress' ? <Clock className="w-3.5 h-3.5" /> : 
                   <CheckCircle2 className="w-3.5 h-3.5" />}
                  {project.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 relative">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1 relative">{project.description}</p>

              {project.required_skills && project.required_skills.length > 0 && (
                <div className="mb-6 relative">
                  <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Seeking Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {project.required_skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-input rounded-md text-xs font-medium text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-border relative">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-foreground hover:text-brand transition-colors"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
