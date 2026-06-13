'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { submitTaskProof } from '@/app/actions/user'
import { motion, AnimatePresence } from 'motion/react'
import {
  Clock, CheckCircle2, XCircle, Send, ExternalLink,
  Code2, Rocket, Trophy, Calendar, Loader2, X
} from 'lucide-react'
import type { Task, Submission } from '@/lib/types'

const TYPE_META: Record<string, { icon: typeof Code2; label: string; accent: string }> = {
  dsa_sprint:       { icon: Code2,    label: 'DSA Sprint',       accent: 'text-info' },
  project_build:    { icon: Rocket,   label: 'Project Build',    accent: 'text-brand' },
  hackathon:        { icon: Trophy,   label: 'Hackathon',        accent: 'text-warning' },
  event_attendance: { icon: Calendar, label: 'Event Attendance', accent: 'text-success' },
}

type Props = {
  initialTasks: Task[]
  initialSubmissions: Submission[]
  userId: string
}

export function TasksClient({ initialTasks, initialSubmissions, userId }: Props) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [submitModal, setSubmitModal] = useState<Task | null>(null)
  const [proofUrl, setProofUrl] = useState('')

  // Cached task list — React Query takes over after SSR hydration
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return (data ?? []) as Task[]
    },
    initialData: initialTasks,
  })

  // Cached user submissions
  const { data: submissions } = useQuery({
    queryKey: ['submissions', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
      return (data ?? []) as Submission[]
    },
    initialData: initialSubmissions,
  })

  // Optimistic submission mutation
  const submitMutation = useMutation({
    mutationFn: async ({ taskId, proofUrl }: { taskId: string; proofUrl: string }) => {
      const fd = new FormData()
      fd.set('taskId', taskId)
      fd.set('proofUrl', proofUrl)
      const result = await submitTaskProof(fd)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      // Invalidate submissions cache so it refetches
      queryClient.invalidateQueries({ queryKey: ['submissions', userId] })
      setSubmitModal(null)
      setProofUrl('')
    },
  })

  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(t => t.task_type === activeFilter)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'dsa_sprint', label: 'DSA' },
    { key: 'project_build', label: 'Projects' },
    { key: 'hackathon', label: 'Hackathons' },
    { key: 'event_attendance', label: 'Events' },
  ]

  function getSubmissionStatus(taskId: string) {
    const sub = submissions.find(s => s.task_id === taskId)
    if (!sub) return null
    return sub.status
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Bounties &amp; Sprints</h1>
        <p className="text-muted-foreground mt-1">Claim tasks, submit proof, earn points.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeFilter === f.key
                ? 'bg-brand text-black border-brand'
                : 'bg-card border-border text-muted-foreground hover:border-brand/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No active tasks right now.</p>
          <p className="text-sm mt-1">Check back soon — new bounties drop weekly.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredTasks.map(task => {
            const meta = TYPE_META[task.task_type] ?? TYPE_META.dsa_sprint
            const Icon = meta.icon
            const status = getSubmissionStatus(task.id)
            const isExpired = task.deadline && new Date(task.deadline) < new Date()

            return (
              <motion.div
                key={task.id}
                variants={itemVariants}
                className="bg-card p-5 rounded-2xl border border-border flex flex-col gap-4 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-input`}>
                      <Icon className={`w-5 h-5 ${meta.accent}`} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{task.title}</p>
                      <p className={`text-xs font-medium ${meta.accent}`}>{meta.label}</p>
                    </div>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-bold">
                    +{task.point_value} pts
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 relative">{task.description}</p>

                {task.deadline && (
                  <p className={`text-xs font-medium flex items-center gap-1.5 ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {isExpired ? 'Expired' : `Due ${new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                )}

                {/* Action / Status */}
                <div className="relative mt-auto pt-2">
                  {status === 'approved' ? (
                    <div className="flex items-center gap-2 text-success text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Approved — Points awarded
                    </div>
                  ) : status === 'pending' ? (
                    <div className="flex items-center gap-2 text-warning text-sm font-semibold">
                      <Clock className="w-4 h-4" /> Under review
                    </div>
                  ) : status === 'rejected' ? (
                    <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
                      <XCircle className="w-4 h-4" /> Rejected
                    </div>
                  ) : isExpired ? (
                    <div className="text-sm text-muted-foreground font-medium">Deadline passed</div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSubmitModal(task)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-black text-sm font-bold shadow-[0_0_12px_rgba(149,253,226,0.2)] hover:shadow-[0_0_18px_rgba(149,253,226,0.4)] transition-all"
                    >
                      <Send className="w-4 h-4" /> Submit Proof
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Submit Proof Modal */}
      <AnimatePresence>
        {submitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSubmitModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Submit Proof</h2>
                <button
                  onClick={() => setSubmitModal(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-1">Task</p>
              <p className="font-bold text-foreground mb-4">{submitModal.title}</p>

              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Proof URL
              </label>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://leetcode.com/submissions/..."
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-brand transition-all"
                />
              </div>

              {submitMutation.error && (
                <p className="text-sm text-destructive font-medium mb-3">
                  {submitMutation.error instanceof Error ? submitMutation.error.message : 'Submission failed'}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!proofUrl || submitMutation.isPending}
                onClick={() => submitMutation.mutate({ taskId: submitModal.id, proofUrl })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-black text-sm font-bold disabled:opacity-40 shadow-[0_0_15px_rgba(149,253,226,0.2)] hover:shadow-[0_0_20px_rgba(149,253,226,0.4)] transition-all"
              >
                {submitMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit</>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
