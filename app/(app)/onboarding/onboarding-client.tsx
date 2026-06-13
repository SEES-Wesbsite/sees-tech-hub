'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/actions/user'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ArrowLeft, Code2, Shield, Brain, Cpu, GraduationCap, Link as LinkIcon, Sparkles, Check } from 'lucide-react'

const TRACKS = [
  { value: 'software',         label: 'Software Engineering', icon: Code2,  desc: 'Web, Mobile, APIs, DevOps' },
  { value: 'cybersecurity',    label: 'Cybersecurity',        icon: Shield, desc: 'Pentesting, Networks, Forensics' },
  { value: 'ai_ml',            label: 'AI / Machine Learning',icon: Brain,  desc: 'Models, Data, NLP, Vision' },
  { value: 'embedded_systems', label: 'Embedded Systems',     icon: Cpu,    desc: 'IoT, Microcontrollers, FPGA' },
] as const

const YEARS = ['100L', '200L', '300L', '400L', '500L'] as const

export function OnboardingClient({ userName }: { userName: string }) {
  const [step, setStep] = useState(0)
  const [track, setTrack] = useState<string | null>(null)
  const [year, setYear] = useState<string | null>(null)
  const [github, setGithub] = useState('')
  const [skills, setSkills] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!track || !year) return
    setIsSubmitting(true)
    setError(null)

    const fd = new FormData()
    fd.set('track', track)
    fd.set('academicYear', year)
    if (github) fd.set('githubUrl', github)
    if (skills) fd.set('skills', skills)

    const result = await completeOnboarding(fd)
    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
    // On success the server action redirects
  }

  const canProceed = step === 0 ? !!track : step === 1 ? !!year : true

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6 shadow-[0_0_40px_rgba(149,253,226,0.1)]">
            <Sparkles className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Welcome, {userName}
          </h1>
          <p className="text-muted-foreground text-lg">Let&apos;s set up your builder profile.</p>
        </motion.div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-brand w-10' : 'bg-border w-6'
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="bg-card p-8 rounded-3xl border border-border shadow-2xl min-h-[340px] flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait" custom={step}>
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold text-foreground mb-1">Pick your track</h2>
                <p className="text-sm text-muted-foreground mb-6">What area of tech excites you the most?</p>

                <div className="grid grid-cols-1 gap-3">
                  {TRACKS.map(t => {
                    const Icon = t.icon
                    const selected = track === t.value
                    return (
                      <motion.button
                        key={t.value}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setTrack(t.value)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                          selected
                            ? 'border-brand bg-brand/10 ring-1 ring-brand'
                            : 'border-border hover:border-brand/30 hover:bg-card/80'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-brand/20' : 'bg-input'}`}>
                          <Icon className={`w-5 h-5 ${selected ? 'text-brand' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                        {selected && <Check className="w-5 h-5 text-brand" />}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold text-foreground mb-1">Academic year</h2>
                <p className="text-sm text-muted-foreground mb-6">What level are you currently in?</p>

                <div className="grid grid-cols-5 gap-3">
                  {YEARS.map(y => (
                    <motion.button
                      key={y}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-4 rounded-2xl border font-bold text-lg transition-all ${
                        year === y
                          ? 'border-brand bg-brand/10 ring-1 ring-brand text-brand'
                          : 'border-border hover:border-brand/30 text-muted-foreground'
                      }`}
                    >
                      {y}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> GitHub URL
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                      placeholder="https://github.com/yourname"
                      className="mt-1.5 block w-full rounded-xl border-0 py-3 px-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-brand transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold text-foreground mb-1">Your skills</h2>
                <p className="text-sm text-muted-foreground mb-6">Comma-separated list of your top skills (optional).</p>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-brand" />
                    <span className="text-sm font-medium text-foreground">Skills</span>
                  </div>
                  <textarea
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. React, Python, Docker, Solidity"
                    rows={3}
                    className="block w-full rounded-xl border-0 py-3 px-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-brand transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="mt-4 text-sm text-destructive font-medium">{error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            {step > 0 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={!canProceed}
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand text-black text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(149,253,226,0.2)] hover:shadow-[0_0_20px_rgba(149,253,226,0.4)] transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand text-black text-sm font-bold disabled:opacity-60 shadow-[0_0_15px_rgba(149,253,226,0.2)] hover:shadow-[0_0_20px_rgba(149,253,226,0.4)] transition-all"
              >
                {isSubmitting ? 'Saving…' : 'Launch my profile'} <Sparkles className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
