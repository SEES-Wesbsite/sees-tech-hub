"use client";

import { useMemo } from "react";
import { TIER_THRESHOLDS, NEXT_TIER_MAP } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RankCardProps {
  score: number;
}

export function RankCard({ score }: RankCardProps) {
  const { currentRank, nextRank, progressPercent, xpToNext, colorHex, emblem } =
    useMemo(() => {
      let currentRank = "E";
      let colorHex = "#A1A1AA";
      let emblem = "◇";

      if (score >= TIER_THRESHOLDS.S) {
        currentRank = "S";
        colorHex = "#FFD700";
        emblem = "👑";
      } else if (score >= TIER_THRESHOLDS.A) {
        currentRank = "A";
        colorHex = "#EF4444";
        emblem = "⬢";
      } else if (score >= TIER_THRESHOLDS.B) {
        currentRank = "B";
        colorHex = "#A855F7";
        emblem = "✧";
      } else if (score >= TIER_THRESHOLDS.C) {
        currentRank = "C";
        colorHex = "#3B82F6";
        emblem = "✦";
      } else if (score >= TIER_THRESHOLDS.D) {
        currentRank = "D";
        colorHex = "#10B981";
        emblem = "◆";
      }

      const nextRank = NEXT_TIER_MAP[currentRank];
      let progressPercent = 100;
      let xpToNext = 0;

      if (nextRank) {
        const currentThreshold = TIER_THRESHOLDS[currentRank];
        const nextThreshold = TIER_THRESHOLDS[nextRank];
        const xpInTier = score - currentThreshold;
        const tierSize = nextThreshold - currentThreshold;
        progressPercent = Math.min(
          100,
          Math.max(0, (xpInTier / tierSize) * 100),
        );
        xpToNext = nextThreshold - score;
      }

      return {
        currentRank,
        nextRank,
        progressPercent,
        xpToNext,
        colorHex,
        emblem,
      };
    }, [score]);

  return (
    <Card className="relative overflow-hidden border-brand/20 bg-gradient-to-br from-brand/10 to-background flex flex-col justify-between shadow-brand/5 shadow-xl">
      {/* Background abstract shapes */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-warning/20 blur-3xl rounded-full pointer-events-none" />

      <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand">Current Rank</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-white/10"
                style={{
                  backgroundColor: `${colorHex}20`,
                  color: colorHex,
                  boxShadow: `0 0 20px ${colorHex}40`,
                }}
              >
                {emblem}
              </div>
              <div>
                <h3
                  className="text-4xl font-black font-serif tracking-tight"
                  style={{ color: colorHex }}
                >
                  {currentRank} Rank
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-brand/10 text-brand p-3 rounded-full">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="w-4 h-4 text-brand" /> Total Experience
              </p>
              <p className="text-2xl font-bold font-mono tracking-tight">
                {score.toLocaleString()}{" "}
                <span className="text-sm text-muted-foreground font-sans">
                  XP
                </span>
              </p>
            </div>
            {nextRank && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next Rank</p>
                <p className="text-sm font-semibold flex items-center gap-1 text-foreground">
                  Class {nextRank}{" "}
                  <ArrowUpRight className="w-3 h-3 text-brand" />
                </p>
              </div>
            )}
          </div>

          {nextRank ? (
            <div className="space-y-1.5">
              <Progress
                value={progressPercent}
                className="h-2 bg-foreground/10"
                indicatorClassName="bg-brand"
              />
              <p className="text-xs text-muted-foreground text-right font-medium">
                <span className="text-brand font-bold">
                  {xpToNext.toLocaleString()} XP
                </span>{" "}
                needed for Class {nextRank}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Progress
                value={100}
                className="h-2 bg-foreground/10"
                indicatorClassName="bg-brand"
              />
              <p className="text-xs text-brand text-right font-bold flex items-center justify-end gap-1">
                <Trophy className="w-3 h-3" /> Max Rank Achieved
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
