'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A highly reusable Question wrapper component.
// It can wrap anything: Multi-choice <OptionCard>s, standard text inputs for "typed" questions, etc.
export interface QuestionProps {
  id: string;
  title?: string; // e.g. "Question 3" or "Daily DSA Challenge"
  text: string;
  type?: 'multiple_choice' | 'subjective' | 'code_review';
  codeSnippet?: string;
  language?: string;
  children: ReactNode; // The options, input boxes, or drag-and-drop elements
  
  // Personalization & Theming Props
  theme?: 'dark' | 'light' | 'brand';
  accentColor?: string; // Hex or tailwind class for custom accents
  animationStyle?: 'slide' | 'fade' | 'zoom' | 'none';
  
  // State
  isEntering?: boolean;
}

export function Question({
  title,
  text,
  codeSnippet,
  language = 'javascript',
  children,
  theme = 'dark',
  animationStyle = 'slide'
}: QuestionProps) {
  
  // Determine animation variants based on prop
  const variants = {
    slide: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    zoom: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 }
    },
    none: {
      initial: {}, animate: {}, exit: {}
    }
  }[animationStyle];

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`w-full max-w-3xl mx-auto flex flex-col gap-6 p-6 md:p-10 rounded-3xl backdrop-blur-md border shadow-2xl ${
        theme === 'brand' ? 'bg-brand/10 border-brand/20' : 
        theme === 'light' ? 'bg-white/90 border-black/10 text-black' : 
        'bg-black/60 border-white/10 text-white' // default dark
      }`}
    >
      {/* Header / Meta */}
      {title && (
        <div className="text-sm font-bold uppercase tracking-widest text-brand-light">
          {title}
        </div>
      )}

      {/* The Actual Question Text */}
      <h2 className="text-2xl md:text-3xl font-serif font-medium leading-relaxed">
        {text}
      </h2>

      {/* Code Snippet Block (If Applicable) */}
      {codeSnippet && (
        <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] p-5 shadow-inner mt-2">
          {/* We will add react-syntax-highlighter here later, but for now standard <pre> */}
          <div className="absolute top-0 right-0 px-3 py-1 bg-white/10 text-xs font-mono text-white/50 rounded-bl-lg">
            {language}
          </div>
          <pre className="text-sm font-mono text-brand overflow-x-auto whitespace-pre-wrap leading-loose">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* The Answer Container (Options, Inputs, etc.) passed as children */}
      <div className="w-full mt-4 flex flex-col gap-3">
        {children}
      </div>
    </motion.div>
  );
}
