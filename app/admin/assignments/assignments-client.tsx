"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Users, Sparkles, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  generateWeeklyAssignments,
  bulkGenerateWeeklyAssignments,
  unassignQuest,
} from "@/app/actions/admin-assignments";

// We'll recalculate rank here on the client for display
function calculateRank(points: number): string {
  if (points >= 10000) return "S";
  if (points >= 5000) return "A";
  if (points >= 2500) return "B";
  if (points >= 1000) return "C";
  if (points >= 500) return "D";
  return "E";
}

type UserWithAssignments = {
  id: string;
  full_name: string;
  avatar_url: string;
  total_points: number;
  primary_stacks: string[];
  quest_assignments: {
    id: string;
    status: string;
    quest_bank: {
      id: string;
      title: string;
      difficulty: string;
      quest_type: string;
    };
  }[];
};

export function AssignmentsClient({
  users,
  targetWeekStart,
}: {
  users: UserWithAssignments[];
  targetWeekStart: string;
}) {
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const handleBulkGenerate = async () => {
    if (!confirm("This will run the Recommendation System for ALL users. Proceed?")) return;
    setIsBulkLoading(true);
    await bulkGenerateWeeklyAssignments(targetWeekStart);
    setIsBulkLoading(false);
  };

  const handleUserGenerate = async (userId: string) => {
    setLoadingUser(userId);
    await generateWeeklyAssignments(userId, targetWeekStart);
    setLoadingUser(null);
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm("Remove this assignment?")) return;
    await unassignQuest(assignmentId);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" />
            Weekly Assignments
          </h1>
          <p className="text-muted-foreground mt-1">
            Recommendation System for the week of <span className="font-semibold text-foreground">{targetWeekStart}</span>
          </p>
        </motion.div>

        <Button 
          onClick={handleBulkGenerate} 
          disabled={isBulkLoading}
          className="gap-2 shadow-xl shadow-brand/20"
        >
          {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run System For All
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-border/50">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground font-medium">
            No users found.
          </div>
        ) : (
          users.map((u) => {
            const rank = calculateRank(u.total_points || 0);
            const assignments = u.quest_assignments || [];
            const needsAssignments = assignments.length < 3;

            return (
              <div key={u.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 md:p-6 hover:bg-muted/10 transition-colors gap-6">
                <div className="flex items-start md:items-center gap-4 min-w-0 md:w-[350px] shrink-0">
                  <img 
                    src={u.avatar_url || "/default-avatar.png"} 
                    className="w-12 h-12 rounded-full border border-border bg-muted/50 shrink-0 object-cover" 
                    alt="avatar" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-base truncate">{u.full_name}</span>
                      <span className="font-serif font-bold text-sm text-brand border-l border-border/50 pl-2">
                        {rank}-Rank
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {u.primary_stacks?.length ? u.primary_stacks.join(", ") : "No stacks"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {assignments.length === 0 ? (
                    <span className="text-sm text-muted-foreground italic bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">No quests assigned.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assignments.map(a => (
                        <div key={a.id} className="flex items-center gap-1 group bg-background border border-border rounded-lg pl-2 pr-1 py-1 shadow-sm">
                          <span className="text-xs font-medium text-foreground max-w-[200px] truncate">
                            {a.quest_bank.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded ml-1">
                            {a.quest_bank.difficulty}
                          </span>
                          <button 
                            onClick={() => handleUnassign(a.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                            title="Remove assignment"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-start lg:justify-end shrink-0">
                  {needsAssignments ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUserGenerate(u.id)}
                      disabled={loadingUser === u.id}
                      className="gap-2 h-9 text-xs border-brand/30 text-brand hover:bg-brand/10 w-full lg:w-auto"
                    >
                      {loadingUser === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Generate Quests
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUserGenerate(u.id)}
                      disabled={loadingUser === u.id}
                      className="gap-2 h-9 text-xs text-muted-foreground hover:text-foreground w-full lg:w-auto"
                      title="Regenerate (fills empty slots if any are deleted)"
                    >
                      {loadingUser === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
