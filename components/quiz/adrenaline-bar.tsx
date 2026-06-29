'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AdrenalineBarProps {
  totalTime: number; // Max time in seconds
  timeRemaining: number; // Current time in seconds
  isPaused?: boolean;
}

export function AdrenalineBar({ totalTime, timeRemaining, isPaused = false }: AdrenalineBarProps) {
  // We use a slight internal state to smooth out the exact second ticks if needed, 
  // but Framer Motion handles the width interpolation beautifully.
  
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;

  return (
    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full"
        initial={{ width: '100%' }}
        animate={{ 
          width: `${percentage}%`,
          backgroundColor: percentage > 50 ? '#025c48' : percentage > 20 ? '#eab308' : '#ef4444',
        }}
        transition={{ duration: 0.5, ease: 'linear' }}
      />
      
      {/* Critical Pulse Effect */}
      {isCritical && !isPaused && (
        <motion.div
          className="absolute top-0 left-0 h-full bg-destructive rounded-full"
          initial={{ opacity: 0, width: `${percentage}%` }}
          animate={{ opacity: [0, 0.5, 0], width: `${percentage}%` }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
