'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export function Reveal({ children, className = '', as = 'div' }: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article';
}) {
  const reduceMotion = useReducedMotion();
  const Element = as === 'article' ? motion.article : motion.div;
  return <Element className={className + ' volunteer-reveal'}
    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </Element>;
}
