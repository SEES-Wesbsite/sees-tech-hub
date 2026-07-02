"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Search } from "lucide-react";
import { assignAndStartQuest } from "@/app/actions/user-quests";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AllQuestsClientProps {
  allQuests: any[];
}

export function AllQuestsClient({ allQuests }: AllQuestsClientProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const handleStartGlobalQuest = async (questId: string) => {
    try {
      setStartingId(questId);
      const res = await assignAndStartQuest(questId);
      if ('error' in res) {
        throw new Error(res.error);
      }
      router.push(`/quiz/${res.data?.sessionId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to start global quest.");
      setStartingId(null);
    }
  };

  const filteredQuests = useMemo(() => {
    return allQuests.filter(quest => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !quest.title.toLowerCase().includes(query) && 
          !quest.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // 2. Difficulty Filter
      if (difficultyFilter !== "ALL" && quest.difficulty !== difficultyFilter) {
        return false;
      }

      // 3. Type Filter
      if (typeFilter !== "ALL" && quest.quest_type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [allQuests, searchQuery, difficultyFilter, typeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Global Quest Bank</h2>
          <p className="text-muted-foreground mt-2">
            Explore the full library of active quests available in the hub.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search quests..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl bg-foreground/5 border-border/50 focus-visible:ring-brand"
            />
          </div>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[120px] rounded-xl bg-foreground/5 border-border/50">
              <SelectValue placeholder="Rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ranks</SelectItem>
              <SelectItem value="S">S Rank</SelectItem>
              <SelectItem value="A">A Rank</SelectItem>
              <SelectItem value="B">B Rank</SelectItem>
              <SelectItem value="C">C Rank</SelectItem>
              <SelectItem value="D">D Rank</SelectItem>
              <SelectItem value="E">E Rank</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-foreground/5 border-border/50 capitalize">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="article_read">Article Read</SelectItem>
              <SelectItem value="dsa_problem">DSA Problem</SelectItem>
              <SelectItem value="project_build">Project Build</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {allQuests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-3xl">
          No active quests available in the global bank right now.
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-3xl">
          No quests match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className={`relative overflow-hidden rounded-3xl border bg-foreground/5 backdrop-blur-md p-6 flex flex-col transition-all duration-300 hover:border-brand/50 hover:shadow-[0_0_30px_rgba(2,92,72,0.1)] ${
                quest.isPerfectMatch 
                  ? "border-brand/40 shadow-[0_0_20px_rgba(2,92,72,0.15)] ring-1 ring-brand/20 opacity-100" 
                  : "border-border/50 opacity-90 hover:opacity-100"
              }`}
            >
              {quest.isPerfectMatch && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[40px] rounded-full pointer-events-none" />
              )}
              <div className="mb-4 mt-2 flex items-center justify-between relative z-10">
                <Badge
                  variant="outline"
                  className="bg-background/50 backdrop-blur capitalize"
                >
                  {quest.quest_type.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-2">
                  {quest.isPerfectMatch && (
                    <Badge variant="default" className="bg-brand text-brand-dark animate-pulse">
                      🎯 Perfect Match
                    </Badge>
                  )}
                  <span className="text-xs text-brand font-mono font-bold tracking-widest uppercase bg-brand/10 px-2 py-1 rounded">
                    RANK {quest.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                {quest.title}
              </h3>

              <p className="text-muted-foreground text-sm flex-grow">
                {quest.description}
              </p>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                <span className="font-mono text-lg font-bold text-brand">
                  +{quest.point_value} XP
                </span>

                {quest.quest_type === "quiz" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStartGlobalQuest(quest.id)}
                    disabled={startingId === quest.id}
                    className="rounded-full px-6 border-brand text-brand hover:bg-brand hover:text-brand-foreground"
                  >
                    {startingId === quest.id ? (
                      "Loading..."
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Take Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
