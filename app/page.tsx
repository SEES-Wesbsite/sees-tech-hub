'use client'

import { motion } from 'motion/react'
import { ArrowRight, Code2, Rocket, Shield, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  }

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } }
  }

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-brand selection:text-black">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-light/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-8 h-8 text-brand" />
          <span className="text-xl font-bold tracking-tighter">STH.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Member Login
          </Link>
          <Link href="/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-card border border-border rounded-full text-sm font-semibold hover:border-brand/50 hover:shadow-[0_0_20px_rgba(149,253,226,0.15)] transition-all"
            >
              Apply for Access
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-24 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={heroVariants} className="max-w-4xl">
          <motion.div variants={textVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand border border-brand/20 mb-8 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Exclusive SEES Tech Community
          </motion.div>
          
          <motion.h1 variants={textVariants} className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8">
            Build the Future. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-light to-brand">
              Verify your craft.
            </span>
          </motion.h1>
          
          <motion.p variants={textVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            SEES Tech Hub is a private collective for UNILAG&apos;s top engineering talent. Ship projects, conquer algorithms, and rise through the ranks from Explorer to Pioneer.
          </motion.p>
          
          <motion.div variants={textVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2 px-8 py-4 bg-brand text-black rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(149,253,226,0.3)] hover:shadow-[0_0_40px_rgba(149,253,226,0.5)] transition-all"
              >
                Join the Hub
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl"
        >
          <motion.div variants={featureVariants} className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-3xl hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 border border-brand/20">
              <Code2 className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-xl font-bold mb-3">Project Bounties</h3>
            <p className="text-muted-foreground">Claim weekly tasks, build real-world systems, and earn points for your contributions.</p>
          </motion.div>

          <motion.div variants={featureVariants} className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-3xl hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-light/10 flex items-center justify-center mb-6 border border-brand-light/20">
              <Rocket className="w-6 h-6 text-brand-light" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tiered Growth</h3>
            <p className="text-muted-foreground">Start as an Explorer and climb the global leaderboard to achieve the legendary Pioneer status.</p>
          </motion.div>

          <motion.div variants={featureVariants} className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-3xl hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark/10 flex items-center justify-center mb-6 border border-brand-dark/20">
              <Shield className="w-6 h-6 text-brand-dark" />
            </div>
            <h3 className="text-xl font-bold mb-3">Verified Network</h3>
            <p className="text-muted-foreground">AI-backed identity verification ensures our ecosystem remains exclusive to true engineers.</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
