'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckSquare, ExternalLink, Check, X, Loader2 } from 'lucide-react'
import { reviewSubmission } from '@/app/actions/admin'

type PendingSubmission = {
  id: string
  proof_url: string
  submitted_at: string
  user: { full_name: string, track: string | null }
  task: { title: string, points: number }
}

export function SubmissionsClient({ initialSubmissions }: { initialSubmissions: PendingSubmission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    setProcessingId(id)
    const fd = new FormData()
    fd.set('submissionId', id)
    fd.set('status', status)
    
    const result = await reviewSubmission(fd)
    if (result.success) {
      // Optimistically remove from queue
      setSubmissions(prev => prev.filter(s => s.id !== id))
    } else {
      alert(`Error: ${result.error}`)
    }
    setProcessingId(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, x: -50, transition: { duration: 0.2 } }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-brand" />
          Review Queue
        </h1>
        <p className="text-muted-foreground mt-1">Verify task proofs and award points to builders.</p>
      </motion.div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <CheckSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Queue is clear.</p>
          <p className="text-sm mt-1 text-muted-foreground/80">All caught up! Excellent work.</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="grid grid-cols-1 gap-4"
        >
          <AnimatePresence>
            {submissions.map(sub => (
              <motion.div 
                key={sub.id}
                variants={itemVariants}
                exit="exit"
                layout
                className="bg-card border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 rounded bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider">
                      +{sub.task.points} pts
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{sub.task.title}</h3>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Builder: <span className="font-semibold text-foreground">{sub.user.full_name}</span> ({sub.user.track ? sub.user.track.replace('_', ' ') : 'No track'})</p>
                    <p>Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                  </div>

                  <a 
                    href={sub.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-brand hover:underline"
                  >
                    View Proof URL <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleReview(sub.id, 'rejected')}
                    disabled={processingId === sub.id}
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-background transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    {processingId === sub.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleReview(sub.id, 'approved')}
                    disabled={processingId === sub.id}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-success text-black font-bold shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all disabled:opacity-50"
                  >
                    {processingId === sub.id ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing</>
                    ) : (
                      <><Check className="w-5 h-5" /> Approve &amp; Award</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
