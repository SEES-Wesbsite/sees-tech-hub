"use client";

import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import { Sparkles, Trophy, Target, Rocket } from "lucide-react";

const features = [
  {
    icon: Trophy,
    label: "Earn XP",
  },
  {
    icon: Target,
    label: "Personalized quests",
  },
  {
    icon: Rocket,
    label: "Weekly challenges",
  },
];

export function ComingSoon() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-32 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur"
        >
          <Target className="h-7 w-7 text-brand" />
        </motion.div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Coming Soon
        </div>

        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl font-serif">
          Quests
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Personalized weekly quests that help you stay consistent, gain XP,
          unlock achievements, and compete with fellow builders.
        </p>

        <div className="mt-12 flex items-center justify-center">
          <Loader variant="pulse" />
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 text-sm text-muted-foreground">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
