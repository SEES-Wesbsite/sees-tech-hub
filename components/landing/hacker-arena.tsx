"use client";

import { motion } from "motion/react";
import { Terminal } from "lucide-react";
import Link from "next/link";

export function HackerArena() {
  return (
    <section className="py-24 md:py-32 bg-slate-900 text-white px-6 overflow-hidden relative">
      {/* Background Code/Grid Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <pre className="mt-8 text-sm md:text-base text-[#95fde2] font-mono overflow-x-auto scrollbar-thin">
                <code>
                  {`// Problem: Two Sum
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
}

// Status: Accepted (Runtime: 52ms)`}
                </code>
              </pre>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Terminal className="w-4 h-4" />
              DSA Sprints
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-6">
              Stop grinding{" "}
              <span className="font-serif italic text-[#95fde2]">Leetcode</span>{" "}
              alone.
            </h2>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Technical interviews are brutal. That's why we don't prepare in
              isolation. Join competitive DSA squads, race to solve algorithmic
              challenges, and get peer-reviewed feedback on your code.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors"
            >
              Join the Arena
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
