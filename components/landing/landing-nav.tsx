"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto right-0"
    >
      <div className="flex items-center gap-2">
        <Logo variant="logomark" className="w-10 h-10 text-slate-900" />
        <span className="text-xl font-serif font-bold tracking-tighter text-slate-900">
          STH
        </span>
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="#"
          className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          WhatsApp Community
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Join the Hub
        </Link>
      </div>
    </motion.nav>
  );
}
