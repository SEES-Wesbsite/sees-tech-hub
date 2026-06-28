"use client";

import { motion } from "framer-motion";
import { RankWidget } from "@/components/dashboard/rank-widget";
import { QuestBoard } from "@/components/dashboard/quest-board";
import { Quest, Profile } from "@/lib/types";
import { Sparkles } from "lucide-react";
import LightRays from "@/components/LightRays";

interface DashboardClientProps {
  profile: Profile;
  activeQuests: Quest[];
}

export function DashboardClient({
  profile,
  activeQuests,
}: DashboardClientProps) {
  return (
    <div className="w-full relative min-h-screen">
      {/* Dynamic Light Rays Background spanning top area */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        {/* <LightRays /> */}
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header section over the light rays */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground flex flex-col md:flex-row md:items-center gap-3 drop-shadow-2xl">
            Welcome back,{" "}
            <span className="text-gradient">
              {profile.preferred_name || profile.full_name}
            </span>
          </h1>
        </motion.div>

        {/* Main Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-8 w-full mt-8">
          {/* Rank Display Area */}
          <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col items-center">
            {/* Desktop Lanyard (hidden on mobile) */}
            <div className="hidden md:flex justify-center items-center w-full h-[600px]">
              <RankWidget score={profile.total_points} />
            </div>

            {/* Mobile Rank Placeholder (hidden on desktop) */}
            <div className="flex md:hidden justify-center items-center w-full h-40 bg-foreground/5 border border-border/50 rounded-2xl backdrop-blur-md">
              <span className="text-muted-foreground font-mono text-sm">
                Mobile Rank Display Placeholder
              </span>
            </div>
          </div>

          {/* The rest of the dashboard UI placeholder */}
          <div className="w-full lg:w-2/3 xl:w-3/4 min-h-[60vh] bg-foreground/5 border border-border/50 rounded-3xl backdrop-blur-md p-8 flex items-center justify-center">
            <span className="text-muted-foreground font-mono">
              Rest of dashboard UI placeholder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
