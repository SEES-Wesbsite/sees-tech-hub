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
    if (!confirm("This will run the Recommendation Engine for ALL users. Proceed?")) return;
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
            Recommendation Engine for the week of <span className="font-semibold text-foreground">{targetWeekStart}</span>
          </p>
        </motion.div>

        <Button 
          onClick={handleBulkGenerate} 
          disabled={isBulkLoading}
          className="gap-2 shadow-xl shadow-brand/20"
        >
          {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run Engine For All
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Assigned Quests</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const rank = calculateRank(u.total_points || 0);
                const assignments = u.quest_assignments || [];
                const needsAssignments = assignments.length < 3;

                return (
                  <TableRow key={u.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.avatar_url || "/default-avatar.png"} 
                          className="w-10 h-10 rounded-full border border-border bg-muted/50" 
                          alt="avatar" 
                        />
                        <div>
                          <div className="font-medium text-foreground">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                            {u.primary_stacks?.length ? u.primary_stacks.join(", ") : "No stacks"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-serif font-bold text-lg text-brand">
                        {rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      {assignments.length === 0 ? (
                        <span className="text-sm text-muted-foreground italic">No quests assigned.</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {assignments.map(a => (
                            <div key={a.id} className="flex items-center gap-2 group">
                              <Badge variant="outline" className="bg-background text-xs truncate max-w-[300px]">
                                {a.quest_bank.title}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] capitalize">
                                {a.quest_bank.difficulty} • {a.quest_bank.quest_type.split('_')[0]}
                              </Badge>
                              <button 
                                onClick={() => handleUnassign(a.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                                title="Remove assignment"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {needsAssignments ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUserGenerate(u.id)}
                          disabled={loadingUser === u.id}
                          className="gap-2 h-8 text-xs border-brand/30 text-brand hover:bg-brand/10"
                        >
                          {loadingUser === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Generate
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleUserGenerate(u.id)}
                          disabled={loadingUser === u.id}
                          className="gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                          title="Regenerate (fills empty slots if any are deleted)"
                        >
                          {loadingUser === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
