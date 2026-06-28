'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Logo } from './logo'

export type LoaderVariant = 'spin-reverse' | 'pulse' | 'bounce' | 'simple-spin'

interface LoaderProps {
  variant?: LoaderVariant
  className?: string
  logoClassName?: string
}

export function Loader({ 
  variant = 'spin-reverse', 
  className = 'w-6 h-6', 
  logoClassName = 'w-full h-full' 
}: LoaderProps) {
  
  if (variant === 'spin-reverse') {
    return (
      <motion.div
        className={className}
        animate={{ rotate: [0, 1080, 1080, 0, 0] }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          times: [0, 0.45, 0.5, 0.95, 1],
          repeat: Infinity,
        }}
      >
        <Logo variant="logomark" className={logoClassName} />
      </motion.div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <motion.div
          className="absolute inset-0 rounded-full bg-brand/20"
          animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-brand/50"
          animate={{ scale: [1, 2.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="relative z-10"
          animate={{ scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        >
          <Logo variant="logomark" className={logoClassName} />
        </motion.div>
      </div>
    )
  }

  if (variant === 'bounce') {
    return (
      <motion.div
        className={className}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity }}
      >
        <Logo variant="logomark" className={logoClassName} />
      </motion.div>
    )
  }

  // Default: simple-spin
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
    >
      <Logo variant="logomark" className={logoClassName} />
    </motion.div>
  )
}
