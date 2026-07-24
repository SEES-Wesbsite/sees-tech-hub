"use client";

import { motion } from "framer-motion";
import { RankCard } from "@/components/dashboard/rank-card";
import { DashboardKPICard } from "@/components/dashboard/dashboard-kpi-card";
import { LeaderboardList } from "@/components/dashboard/leaderboard-list";
import { RecommendedOpportunities } from "@/components/dashboard/recommended-opportunities";
import { RecommendedEvents } from "@/components/dashboard/recommended-events";
import { Quest, Profile } from "@/lib/types";
import { CheckCircle, CalendarDays } from "lucide-react";

interface DashboardClientProps {
  profile: Profile;
  activeQuests: Quest[];
  kpis: {
    questsCompleted: number;
    eventsRSVPd: number;
  };
  leaderboard: any[];
  recommendedOpportunities: any[];
  upcomingEvents: any[];
}

export function DashboardClient({
  profile,
  activeQuests,
  kpis,
  leaderboard,
  recommendedOpportunities,
  upcomingEvents,
}: DashboardClientProps) {
  return (
    <div className="w-full relative min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground flex flex-col md:flex-row md:items-center gap-3 drop-shadow-2xl">
            Welcome back,{" "}
            <span className="text-gradient">
              {profile.preferred_name || profile.full_name}
            </span>
          </h1>
        </motion.div>

        {/* Top Section: 4-Column Grid (RankCard + KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* RankCard takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 hidden"
          >
            <RankCard score={profile.total_points} />
          </motion.div>

          {/* KPI 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DashboardKPICard
              title="Quests Completed"
              value={kpis.questsCompleted}
              icon={<CheckCircle />}
              description="Total approved quests"
            />
          </motion.div>

          {/* KPI 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DashboardKPICard
              title="Events RSVP'd"
              value={kpis.eventsRSVPd}
              icon={<CalendarDays />}
              description="Upcoming & Past Events"
            />
          </motion.div>
        </div>

        {/* Bottom Section: Leaderboard, Opportunities, Events */}
        <div className="hidden grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <LeaderboardList users={leaderboard} currentUserProfile={profile} />
          </motion.div>

          {/* Column 2 & 3: Opportunities & Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            <RecommendedOpportunities
              opportunities={recommendedOpportunities}
            />
            <RecommendedEvents events={upcomingEvents} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
