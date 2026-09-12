'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import styles from './scholarship.module.css';

export function ScholarshipFaq({ questions }: { questions: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  return <div className={styles.questions}>
    {questions.map(({ question, answer }, index) => {
      const open = openIndex === index;
      const buttonId = `scholarship-faq-${index}`;
      const answerId = `${buttonId}-answer`;
      return <div className={styles.question} key={question}>
        <h3>
          <button type="button" id={buttonId} aria-expanded={open} aria-controls={answerId}
            onClick={() => setOpenIndex(open ? null : index)}>
            {question}
            <motion.span aria-hidden="true" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}><Plus size={20} /></motion.span>
          </button>
        </h3>
        <motion.div id={answerId} role="region" aria-labelledby={buttonId} aria-hidden={!open} inert={!open}
          className={styles.answer} initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}>
          <p>{answer}</p>
        </motion.div>
      </div>;
    })}
    <noscript><div className={styles.faqFallback}>{questions.map(({ question, answer }) => <div key={question}><h3>{question}</h3><p>{answer}</p></div>)}</div></noscript>
  </div>;
}
