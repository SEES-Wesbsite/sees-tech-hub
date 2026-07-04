"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Code2, Terminal, Database, Cpu } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-white overflow-hidden px-6 pt-20">
      {/* Subtle background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Floating subtle elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] w-16 h-16 rounded-2xl border border-slate-200/50 bg-slate-50/50 backdrop-blur-sm pointer-events-none hidden md:flex items-center justify-center shadow-sm"
      >
        <Code2 className="w-8 h-8 text-blue-500 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[30%] right-[15%] w-24 h-24 rounded-full border border-slate-200/50 bg-slate-50/50 backdrop-blur-sm pointer-events-none hidden md:flex items-center justify-center shadow-sm"
      >
        <Terminal className="w-10 h-10 text-brand opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[20%] left-[25%] w-12 h-12 rounded-lg border border-slate-200/50 bg-slate-50/50 backdrop-blur-sm pointer-events-none hidden md:flex items-center justify-center rotate-12 shadow-sm"
      >
        <Cpu className="w-6 h-6 text-purple-500 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 25, 0], rotate: [0, 15, 0] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-[30%] right-[25%] w-20 h-20 rounded-3xl border border-slate-200/50 bg-slate-50/50 backdrop-blur-sm pointer-events-none hidden md:flex items-center justify-center shadow-sm"
      >
        <Database className="w-8 h-8 text-orange-500 opacity-60" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold tracking-wide uppercase mb-8">
            SEES Tech Hub
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-slate-900 tracking-tight leading-[1.1] text-balance mb-8"
        >
          Navigate your{" "}
          <span className="font-serif italic font-medium text-brand">
            tech career
          </span>{" "}
          as a student.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 text-balance leading-relaxed"
        >
          Become a master at DSA, win hackathons, and build the ultimate
          portfolio to land your dream job in Big Tech before you graduate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-light text-white rounded-full font-bold transition-all shadow-lg hover:shadow-brand/25 flex items-center justify-center gap-2"
          >
            Join the Hub <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="https://chat.whatsapp.com/JAIc2yFhyqAL30lD3bBXis?s=cl&p=a&mlu=0&ilr=0"
            target="_blank"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full font-bold transition-all flex items-center justify-center"
          >
            Join the WhatsApp Community
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
