'use client';

import { animate, inView, motion, stagger, useAnimate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './scholarship.module.css';

const ease = [0.22, 1, 0.36, 1] as const;
const GRID_SIZE = 80;
const GRID_ROWS = 9;

// Initial content is visible in the server HTML and when JavaScript is unavailable.
export function DepthReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  return <div className={styles.perspective}>
    <motion.div className={`${styles.depth} ${className}`}
      initial={reducedMotion ? false : {
        opacity: 0,
        transform: 'translate3d(0, var(--reveal-y), var(--reveal-z)) scale(0.9)',
      }}
      whileInView={reducedMotion ? undefined : {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
      }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease }}>
      {children}
    </motion.div>
  </div>;
}

export function ScholarshipHeadline() {
  const reducedMotion = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLHeadingElement>();
  useEffect(() => {
    if (reducedMotion) return;
    const entrance = animate('[data-headline-part]', { y: [12, 0], opacity: [0.65, 1] }, {
      delay: stagger(0.07), duration: 0.65, ease,
    });
    return () => { entrance.stop(); };
  }, [animate, reducedMotion]);

  return <h1 ref={scope} id="scholarship-title" className={styles.headline}>
    <span className={styles.srOnly}>500 DataCamp Scholarships. On Us.</span>
    <span aria-hidden="true" className={styles.headlineLine}>
      <span data-headline-part>500</span>{' '}<span data-headline-part>DataCamp</span>
    </span>
    <span aria-hidden="true" className={styles.headlineLine}><span data-headline-part>Scholarships.</span></span>
    <em aria-hidden="true" className={styles.highlight}>
      {Array.from('On Us.').map((letter, index) => <span data-headline-part key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}
    </em>
  </h1>;
}

export function FadeGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(9);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const update = () => setColumns(Math.max(1, Math.ceil(grid.clientWidth / GRID_SIZE)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return <div ref={gridRef} className={styles.fadeGrid} aria-hidden="true">
    {Array.from({ length: columns * GRID_ROWS }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns) + 1;
      const fadeStart = [7, 8, 6][column % 3];
      const opacity = row < fadeStart ? 1 : Math.max(0, 1 - ((row - fadeStart + 1) * 0.34));
      return <span key={index} style={{ opacity }} />;
    })}
  </div>;
}

export function AmbientMotion() {
  const reducedMotion = useReducedMotion();
  return <div className={styles.ambient} aria-hidden="true">
    <motion.span className={styles.ambientCode} animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [-7, -3, -7] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}>&lt;/&gt;</motion.span>
    <motion.span className={styles.ambientData} animate={reducedMotion ? undefined : { y: [0, 8, 0], rotate: [8, 4, 8] }} transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}>01</motion.span>
  </div>;
}

export function PageEntrances() {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    const seen = new WeakSet<Element>();
    const cleanups = Array.from(document.querySelectorAll<HTMLElement>('[data-enter]')).map((element) =>
      inView(element, () => {
        if (seen.has(element)) return;
        seen.add(element);
        const control = animate(element, { opacity: 1, scale: 1, y: 0 }, { duration: 0.75, ease });
        return () => control.stop();
      }, { amount: 0.3, margin: '0px 0px -8% 0px' })
    );
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [reducedMotion]);
  return null;
}
