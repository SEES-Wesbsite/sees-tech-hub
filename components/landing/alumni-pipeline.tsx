"use client";

import { motion } from "motion/react";
import { Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AlumniPipeline() {
  const companies = ["Bloomberg", "Google", "Meta", "Bank of Scotland", "Goldman Sachs"];

  return (
    <section className="py-24 md:py-32 bg-[#fafafa] px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Briefcase className="w-4 h-4" />
              Alumni Network
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] mb-6">
              Learn from UNILAG alumni thriving in <span className="font-serif italic text-brand">Big Tech.</span>
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We frequently host exclusive talks and mentorship sessions. Hear directly from engineers who walked the exact same halls as you and are now building global products at the world's most demanding companies.
            </p>

            <Link href="/events" className="group inline-flex items-center gap-2 text-brand font-bold hover:text-brand-dark transition-colors">
              Explore upcoming talks 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Minimalist Logo Cloud / Roster representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {companies.map((company, i) => (
              <div 
                key={company} 
                className={`flex items-center justify-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${i === companies.length - 1 ? 'col-span-2' : ''}`}
              >
                <span className="font-serif font-semibold text-xl md:text-2xl text-slate-800 text-center">
                  {company}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
