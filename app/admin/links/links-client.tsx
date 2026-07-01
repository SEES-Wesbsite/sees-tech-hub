'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link as LinkIcon, Plus, Copy, ExternalLink, Activity, Check } from 'lucide-react'
import { createShortLink } from '@/app/actions/admin-links'
import { Loader } from '@/components/ui/loader'

type ShortLink = {
  id: string
  slug: string
  destination_url: string
  description: string | null
  clicks: number
  created_at: string
  users?: { full_name: string }
}

export function LinksClient({ initialLinks }: { initialLinks: ShortLink[] }) {
  const [links] = useState(initialLinks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Form state
  const [slug, setSlug] = useState('')
  const [originalUrl, setOriginalUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const fd = new FormData()
    if (slug) fd.set('slug', slug)
    fd.set('originalUrl', originalUrl)
    if (description) fd.set('description', description)

    const result = await createShortLink(fd)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      // Refresh the page to get the new list from the server
      window.location.reload()
    }
  }

  function handleCopy(slug: string, id: string) {
    navigator.clipboard.writeText(`${origin}/go/${slug}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground flex items-center gap-3">
            <LinkIcon className="w-8 h-8 text-brand" />
            Short Links
          </h1>
          <p className="text-muted-foreground mt-1">Manage branded redirects for the hub (e.g. /go/dsa-form).</p>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-black font-serif font-semibold shadow-[0_0_15px_rgba(149,253,226,0.2)] hover:shadow-[0_0_20px_rgba(149,253,226,0.4)] transition-all"
        >
          <Plus className="w-5 h-5" /> New Link
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="flex flex-col divide-y divide-border/50">
          {links.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground font-medium">
              No short links created yet.
            </div>
          ) : (
            links.map(link => (
              <motion.div variants={itemVariants} key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/10 transition-colors gap-4">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif font-semibold text-foreground text-base">
                      /go/{link.slug}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 text-xs font-semibold text-foreground border border-border">
                      <Activity className="w-3 h-3 text-muted-foreground" /> {link.clicks}
                    </div>
                  </div>
                  {link.description && <span className="text-sm text-muted-foreground mb-2">{link.description}</span>}
                  
                  <div className="flex items-center gap-1.5 max-w-xs md:max-w-md">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <a href={link.destination_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand truncate hover:underline">
                      {link.destination_url}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() => handleCopy(link.slug, link.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-input hover:bg-muted transition-colors text-sm font-medium text-foreground border border-border"
                    title="Copy to clipboard"
                  >
                    {copiedId === link.id ? <><Check className="w-4 h-4 text-success" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6">Create Short Link</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Destination URL *</label>
                  <input
                    type="url"
                    required
                    value={originalUrl}
                    onChange={e => setOriginalUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/..."
                    className="block w-full rounded-xl border-0 py-3 px-4 text-foreground bg-input/50 ring-1 ring-inset ring-border focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Custom Slug (optional)</label>
                  <div className="flex items-center">
                    <span className="px-4 py-3 bg-input border border-r-0 border-border rounded-l-xl text-muted-foreground text-sm font-medium">
                      /go/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="e.g. hackathon-2026"
                      className="block w-full rounded-none rounded-r-xl border-0 py-3 px-4 text-foreground bg-input/50 ring-1 ring-inset ring-border focus:ring-2 focus:ring-brand transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Internal Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this link for?"
                    className="block w-full rounded-xl border-0 py-3 px-4 text-foreground bg-input/50 ring-1 ring-inset ring-border focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>

                {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl font-serif font-semibold text-muted-foreground hover:bg-input transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !originalUrl}
                    className="flex-1 py-3 rounded-xl bg-brand text-black font-serif font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(149,253,226,0.3)] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader variant="simple-spin" className="w-4 h-4" /> Saving</> : 'Create Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
