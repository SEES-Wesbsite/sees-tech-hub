"use client";

import { motion } from "motion/react";
import { Trophy, Code, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Hackathons() {
  return (
    <section className="py-24 md:py-32 bg-white px-6">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-6 mx-auto">
          <Code className="w-4 h-4" />
          Hackathons & Builders
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] mb-6 max-w-2xl mx-auto">
          Form squads. Build products. <span className="font-serif italic text-brand">Win.</span>
        </h2>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The best resume is a shipped product. We organize intense, weekend-long building sprints where you collaborate with designers and developers to create real-world solutions.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden"
        >
          {/* Decorative Winner Badge */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-warning/10 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-warning/40" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The ultimate portfolio builder.</h3>
              <p className="text-slate-600 mb-6">
                Stand out to recruiters by showing them what you've actually built. From idea to deployment, our hackathons force you to learn modern stacks and work in high-pressure environments.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Team formation & matching",
                  "Mentorship from senior students",
                  "Prizes and recognition",
                  "Resume-ready deployments"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/tasks" className="inline-flex items-center gap-2 text-brand font-bold hover:text-brand-dark transition-colors">
                View Active Bounties <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual Representation of a Project Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                {/* Abstract image placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-info/20" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900">Project Nebula</h4>
                <span className="px-2 py-1 bg-brand/10 text-brand text-xs font-bold rounded-md">1st Place</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Built by Squad Alpha • React, Next.js, Supabase</p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
