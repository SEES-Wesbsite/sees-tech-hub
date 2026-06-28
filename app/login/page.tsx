'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=1200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=1200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=1200&fit=crop&q=80',
]

export default function LoginPage() {
  const supabase = createClient()
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % SLIDESHOW_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Image Slideshow */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={SLIDESHOW_IMAGES[currentImage]}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-white/90 text-lg font-semibold">SEES Tech Hub</p>
          <p className="text-white/60 text-sm mt-1">Where builders show their work.</p>
        </div>
        {/* Slideshow indicators */}
        <div className="absolute bottom-12 right-12 flex gap-1.5">
          {SLIDESHOW_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentImage ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to continue to your dashboard.</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-4 py-4 text-sm font-semibold text-background shadow-sm hover:shadow-md transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By signing in, you agree to our terms and conditions.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
