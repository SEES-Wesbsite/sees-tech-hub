"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubmitSuccessProps {
  name: string;
  onDismiss: () => void;
}

export function SubmitSuccess({ name, onDismiss }: SubmitSuccessProps) {
  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-sm border border-green-100"
      >
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-6"
      >
        Submission Received!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed"
      >
        Thank you, <strong className="text-slate-900">{name}</strong>! We've received your submission and will be in touch within the next few days. Keep an eye on your inbox.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={onDismiss}
          size="lg"
          className="h-14 px-8 text-lg rounded-full shadow-xl shadow-brand/20 text-white hover:bg-brand-light bg-brand"
        >
          Done
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg rounded-full bg-white border-slate-200 hover:bg-slate-50 text-slate-900"
        >
          <Link href="/hackathon">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Hackathon
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
