'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface OptionCardProps {
  id: string;
  label: string;
  content: string; // E.g., "A", "B", or the actual option text
  status: 'idle' | 'selected' | 'correct' | 'incorrect';
  isDisabled: boolean;
  onClick: (id: string) => void;
  showIcon?: boolean;
}

export function OptionCard({ 
  id, 
  label, 
  content, 
  status, 
  isDisabled, 
  onClick,
  showIcon = true
}: OptionCardProps) {
  
  // Dynamic styling based on status
  let baseClasses = "relative w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all overflow-hidden ";
  let icon = null;

  switch (status) {
    case 'idle':
      baseClasses += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/90 cursor-pointer";
      break;
    case 'selected':
      baseClasses += "bg-brand/20 border-brand text-brand-light shadow-[0_0_20px_rgba(2,92,72,0.4)]";
      break;
    case 'correct':
      baseClasses += "bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.4)] z-10";
      icon = <CheckCircle2 className="w-6 h-6 text-success absolute right-5" />;
      break;
    case 'incorrect':
      baseClasses += "bg-destructive/20 border-destructive text-destructive opacity-50";
      icon = <XCircle className="w-6 h-6 text-destructive absolute right-5" />;
      break;
  }

  if (isDisabled && status === 'idle') {
    baseClasses += " opacity-40 cursor-not-allowed";
  }

  // Animation variants
  const variants = {
    idle: { scale: 1, x: 0 },
    hover: !isDisabled ? { scale: 1.02, y: -2 } : {},
    tap: !isDisabled ? { scale: 0.98 } : {},
    incorrect: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }, // Shake effect
    correct: { scale: [1, 1.05, 1], transition: { duration: 0.3 } }, // Pulse effect
  };

  return (
    <motion.button
      type="button"
      onClick={() => !isDisabled && onClick(id)}
      disabled={isDisabled}
      className={baseClasses}
      variants={variants}
      initial="idle"
      whileHover={status === 'idle' ? "hover" : ""}
      whileTap={status === 'idle' ? "tap" : ""}
      animate={status === 'incorrect' ? 'incorrect' : status === 'correct' ? 'correct' : 'idle'}
    >
      <div className="flex items-center gap-4 w-full">
        {/* The Option Letter (e.g., A, B, C) */}
        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-lg 
          ${status === 'idle' ? 'bg-black/40 text-white/50' : 
            status === 'selected' ? 'bg-brand text-brand-dark' : 
            status === 'correct' ? 'bg-success text-black' : 'bg-destructive/50 text-white'}
        `}>
          {label}
        </div>
        
        {/* The Option Content */}
        <div className="font-medium text-lg pr-8">
          {content}
        </div>
      </div>

      {/* Status Icon */}
      {showIcon && icon}

      {/* Correct flash overlay */}
      {status === 'correct' && (
        <motion.div 
          className="absolute inset-0 bg-success mix-blend-overlay"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
}
