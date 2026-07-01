"use client";

import { Monitor, Cpu, Shield, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui/fade-in";

const TRACKS = [
  {
    id: "software",
    title: "Software Engineering",
    description: "Campus Utility & Productivity Tools",
    icon: Smartphone,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "ai",
    title: "AI & Machine Learning",
    description: "Automating Student Life & Academic Workflows",
    icon: Cpu,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Networking",
    description: "Securing Campus Data & Student Identity",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    id: "embedded",
    title: "Embedded Systems",
    description: "IoT and Physical Automation for Labs and Hostels",
    icon: Monitor,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

export function TracksSection() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <FadeIn className="container px-4 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            Hackathon Tracks
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Choose a track that aligns with your skills and build something that solves real UNILAG problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRACKS.map((track) => (
            <div
              key={track.id}
              className={cn(
                "relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group bg-white border border-slate-200"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                  track.bgColor
                )}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
                    track.bgColor,
                    track.color
                  )}
                >
                  <track.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {track.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {track.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
