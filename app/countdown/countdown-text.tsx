"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Countdown } from "./countdown";
import { Loader } from "@/components/ui/loader";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function CountdownText() {
  return (
    <>
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1.05, 0.95, 1.05],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/3 rotate-[30deg] opacity-20"
          animate={{ rotate: [30, 35, 30] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Loader variant="pulse" className="h-20 w-20" />
        </motion.div>

        <motion.div
          className="absolute top-2/3 left-2/3 rotate-[30deg] opacity-10"
          animate={{ rotate: [30, 25, 30] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <Loader variant="spin-reverse" className="h-20 w-20" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 z-10 mx-auto flex h-screen max-w-3xl flex-col items-center justify-center px-6 text-center md:px-10"
      >
        <motion.div variants={item}>
          <Logo className="h-15 w-15" />
        </motion.div>

        <motion.span
          variants={item}
          className="m-6 rounded-full border border-border bg-card px-4 py-1 text-sm font-medium text-muted-foreground"
        >
          Launching Soon
        </motion.span>

        <motion.h1
          variants={item}
          className="font-serif text-5xl font-bold tracking-tight md:text-7xl"
        >
          SEES Tech Hub
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-xl text-lg text-brand">
          We're putting the finishing touches on everything. See you at launch.
        </motion.p>

        <motion.div variants={item} className="mt-14 w-full">
          <Countdown targetDate="2026-07-04T18:00:00+01:00" />
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center gap-2"
        >
          <p className="mt-10 font-serif text-base text-brand">
            July 4 • 6:00 PM WAT
          </p>
          <div className="h-px w-3/4 bg-brand" />
        </motion.div>
      </motion.div>
    </>
  );
}
