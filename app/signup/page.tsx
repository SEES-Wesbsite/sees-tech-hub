'use client'

import { signup } from '@/app/actions/auth'
import { motion } from 'motion/react'
import { ArrowRight, UserPlus, Mail, Lock, User, Hash } from 'lucide-react'

export default function SignupPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10 py-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6 shadow-[0_0_40px_rgba(149,253,226,0.1)]">
            <UserPlus className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-3">Join STH</h2>
          <p className="text-muted-foreground text-lg">
            Create your builder profile.
          </p>
        </motion.div>

        <motion.form variants={itemVariants} action={signup as unknown as (payload: FormData) => void} className="space-y-6 bg-card p-8 rounded-3xl border border-border shadow-2xl">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="matric" className="text-sm font-medium text-foreground ml-1">
                Matric Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="matric"
                  name="matric"
                  type="text"
                  required
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand transition-all duration-200"
                  placeholder="e.g. 123456"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contactEmail" className="text-sm font-medium text-foreground ml-1">
                Personal Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand transition-all duration-200"
                  placeholder="john@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium text-foreground ml-1">
                Create a 6-Digit PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-foreground bg-input/50 ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-brand transition-all duration-200 tracking-[0.2em]"
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-brand px-4 py-3.5 mt-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(149,253,226,0.3)] hover:shadow-[0_0_25px_rgba(149,253,226,0.5)] transition-all"
          >
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.form>
        
        <motion.p variants={itemVariants} className="text-center mt-8 text-muted-foreground">
          Already a member?{' '}
          <a href="/login" className="font-semibold text-brand hover:text-brand-light transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand after:origin-right after:scale-x-0 hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300">
            Sign in
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
