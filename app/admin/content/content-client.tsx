'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FilePlus, Code2, Calendar, FolderGit2, Briefcase, Loader2, CheckCircle2 } from 'lucide-react'
import { createTask, createEvent, createProject, createJob } from '@/app/actions/admin-content'

const TABS = [
  { id: 'task', label: 'Bounty/Task', icon: Code2 },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'project', label: 'Project', icon: FolderGit2 },
  { id: 'job', label: 'Job', icon: Briefcase },
]

export function ContentClient() {
  const [activeTab, setActiveTab] = useState('task')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    
    const formData = new FormData(e.currentTarget)
    let result

    switch (activeTab) {
      case 'task':
        result = await createTask(formData)
        break
      case 'event':
        result = await createEvent(formData)
        break
      case 'project':
        result = await createProject(formData)
        break
      case 'job':
        result = await createJob(formData)
        break
    }

    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg(`Successfully created new ${activeTab}!`)
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => setSuccessMsg(null), 3000)
    }
    setIsSubmitting(false)
  }

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <FilePlus className="w-8 h-8 text-brand" />
          Content Engine
        </h1>
        <p className="text-muted-foreground mt-1">Publish new bounties, events, and opportunities to the platform.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSuccessMsg(null)
              setErrorMsg(null)
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand text-foreground bg-brand/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 text-success font-semibold">
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </div>
        )}
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* TASK FORM */}
            {activeTab === 'task' && (
              <motion.div key="task" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Task Title</label>
                  <input type="text" name="title" required className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Task Type</label>
                    <select name="taskType" className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand text-foreground">
                      <option value="dsa_sprint">DSA Sprint</option>
                      <option value="project_build">Project Build</option>
                      <option value="hackathon">Hackathon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Point Value</label>
                    <input type="number" name="pointValue" required min="1" className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description (Markdown supported)</label>
                  <textarea name="description" required rows={4} className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Deadline (Optional)</label>
                  <input type="datetime-local" name="deadline" className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand dark:[color-scheme:dark]" />
                </div>
              </motion.div>
            )}

            {/* EVENT FORM */}
            {activeTab === 'event' && (
              <motion.div key="event" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Event Title</label>
                  <input type="text" name="title" required className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Date & Time</label>
                    <input type="datetime-local" name="eventDate" required className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand dark:[color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Points Awarded</label>
                    <input type="number" name="pointsAwarded" defaultValue="0" min="0" className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
                  <input type="text" name="location" placeholder="e.g. CITS Hall or Google Meet Link" className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea name="description" rows={3} className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand resize-none" />
                </div>
              </motion.div>
            )}

            {/* PROJECT FORM */}
            {activeTab === 'project' && (
              <motion.div key="project" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Project Title</label>
                  <input type="text" name="title" required className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea name="description" required rows={4} className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Required Skills (Comma separated)</label>
                  <input type="text" name="skills" placeholder="e.g. Next.js, Postgres, Redis" className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                </div>
              </motion.div>
            )}

            {/* JOB FORM */}
            {activeTab === 'job' && (
              <motion.div key="job" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Job Title</label>
                    <input type="text" name="title" required className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
                    <input type="text" name="company" required className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Application URL</label>
                  <input type="url" name="applyUrl" required placeholder="https://..." className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea name="description" required rows={4} className="block w-full rounded-xl border-0 py-3 px-4 bg-input/50 ring-1 ring-border focus:ring-2 focus:ring-brand resize-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</> : 'Publish to Platform'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
