'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full" />
          <div className="relative w-32 h-32 mx-auto bg-black border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(149,253,226,0.15)]">
            <span className="text-6xl font-black text-brand tracking-tighter drop-shadow-[0_0_10px_rgba(149,253,226,0.5)]">404</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight uppercase italic">
          System Error
        </h1>
        <p className="text-lg text-muted-foreground mb-10 font-medium">
          The requested node could not be located in the SEES mainframe. It may have been deleted, or you typed the wrong coordinate.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-foreground bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-black bg-brand hover:bg-brand-light transition-all shadow-[0_0_15px_rgba(149,253,226,0.3)] hover:shadow-[0_0_25px_rgba(149,253,226,0.5)]"
          >
            <Home className="w-4 h-4" /> Mainframe
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
