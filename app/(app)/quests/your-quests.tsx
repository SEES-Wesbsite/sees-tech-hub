"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Play, CheckCircle2, AlertCircle } from "lucide-react";
import { startQuestQuiz, generateMyWeeklyQuests } from "@/app/actions/user-quests";
import { CompletedQuests } from "./completed-quests";
import { StudyDrawer } from "@/components/quiz/study-drawer";
import { toast } from "sonner";

interface YourQuestsProps {
  assignments: any[];
  allCompletedAssignments: any[];
}

export function YourQuests({ assignments, allCompletedAssignments }: YourQuestsProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Study Drawer State
  const [studyDrawerOpen, setStudyDrawerOpen] = useState(false);
  const [studyQuizId, setStudyQuizId] = useState<string | null>(null);
  const [studyQuestTitle, setStudyQuestTitle] = useState("");

  const handleOpenStudyDrawer = (quizId: string | null, title: string) => {
    if (!quizId) {
      toast.error("This quest was not a quiz. No study guide available.");
      return;
    }
    setStudyQuizId(quizId);
    setStudyQuestTitle(title);
    setStudyDrawerOpen(true);
  };

  // We only care about the assignments strictly assigned this week (max 3 usually for the weekly 3)
  // Wait, the parent passes `assignments`. Let's assume the parent explicitly limits this to generated ones if possible,
  // or we just render what we get.
  
  const completedCount = assignments.filter((a) => a.status === "completed").length;

  const handleStartQuest = async (assignment: any) => {
    if (assignment.quest_bank.quest_type !== "quiz") {
      setError("This quest type is not supported in the quiz MVP.");
      return;
    }

    try {
      setStartingId(assignment.id);
      setError(null);

      const { sessionId } = await startQuestQuiz(assignment.id);
      router.push(`/quiz/${sessionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start quiz.");
      setStartingId(null);
    }
  };

  const handleGenerateQuests = async () => {
    setGenerating(true);
    setError(null);
    const res = await generateMyWeeklyQuests();
    if (res?.error) setError(res.error);
    setGenerating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress Overview & Streak */}
      <div className="bg-foreground/5 border border-border/50 rounded-3xl p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">The Golden Path</h2>
          <p className="text-muted-foreground mt-2">
            Your personalized weekly assignments. Complete them in order to level up.
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* Flame Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold">
            <span className="text-xl">🔥</span>
            <span>1 Week Streak</span>
          </div>

          <div className="text-right">
            <span className="block text-4xl font-bold text-brand">
              {completedCount} / {Math.min(3, Math.max(3, assignments.length))}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 block">
              Completed
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Quest Cards */}
      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-foreground/5 border border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-6 max-w-md">
            No quests assigned yet. Our engine analyzes your stack and rank to
            recommend the perfect 3 quests to level up.
          </p>
          <Button
            onClick={handleGenerateQuests}
            disabled={generating}
            className="rounded-full px-8 bg-brand hover:bg-brand-light text-brand-foreground"
          >
            {generating ? "Running Engine..." : "Generate My Weekly 3"}
          </Button>
        </div>
      ) : (
        <div className="relative flex flex-col items-center py-10 w-full max-w-2xl mx-auto space-y-16">
          {/* Background Connecting Line */}
          <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-2 bg-foreground/5 rounded-full overflow-hidden">
             {/* Filled Progress Line */}
             <motion.div 
               className="w-full bg-brand origin-top"
               initial={{ scaleY: 0 }}
               animate={{ scaleY: completedCount > 0 ? (completedCount / assignments.length) : 0 }}
               transition={{ duration: 1, ease: "easeInOut" }}
             />
          </div>

          {assignments.map((assignment, idx) => {
            const quest = assignment.quest_bank;
            const isCompleted = assignment.status === "completed";
            
            // UI-based Locking Mechanism: locked if the PREVIOUS quest exists and is NOT completed.
            const isLocked = idx > 0 && assignments[idx - 1].status !== "completed";

            // Alternating offsets for the "Snake" path look
            const offsetClass = idx % 2 === 0 ? "md:-translate-x-12" : "md:translate-x-12";

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className={`relative z-10 w-full max-w-md ${offsetClass} ${isCompleted ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (isCompleted) {
                    handleOpenStudyDrawer(quest.quiz_id, quest.title);
                  }
                }}
              >
                {/* Node Connector Point */}
                <div className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 flex items-center justify-center
                  ${idx % 2 === 0 ? "-right-5 md:-right-16" : "-left-5 md:-left-16"} hidden md:flex
                  ${isCompleted ? "border-brand bg-brand text-brand-dark" : "border-foreground/10 bg-background"}
                `}>
                   {isCompleted && <CheckCircle2 className="w-5 h-5 text-brand-dark" />}
                </div>

                <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                  isCompleted
                    ? "border-brand/30 bg-brand/5 opacity-80"
                    : isLocked
                      ? "border-border/20 bg-foreground/5 opacity-50 grayscale select-none"
                      : "border-border/50 bg-foreground/10 hover:border-brand/50 shadow-xl shadow-brand/5 ring-1 ring-brand/10"
                } backdrop-blur-md p-6 flex flex-col h-full`}>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <Badge
                        variant="default"
                        className="bg-brand text-brand-foreground hover:bg-brand"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                      </Badge>
                    ) : isLocked ? (
                      <Badge variant="secondary" className="bg-foreground/10 text-muted-foreground">
                        Locked
                      </Badge>
                    ) : assignment.status === "in_progress" ? (
                      <Badge
                        variant="outline"
                        className="border-brand text-brand bg-brand/10"
                      >
                        In Progress
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-brand text-brand animate-pulse bg-brand/5">
                        Ready To Play
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4 mt-2 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="bg-background/50 backdrop-blur capitalize"
                    >
                      {quest.quest_type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono font-bold tracking-widest uppercase">
                      RANK {quest.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                    {quest.title}
                  </h3>

                  <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-6">
                    {quest.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                    <span className="font-mono text-lg font-bold text-brand">
                      +{quest.point_value} XP
                    </span>

                    {!isCompleted && quest.quest_type === "quiz" && (
                      <Button
                        onClick={() => handleStartQuest(assignment)}
                        disabled={startingId === assignment.id || isLocked}
                        className={`rounded-full px-6 transition-all ${isLocked ? "bg-muted text-muted-foreground opacity-50" : ""}`}
                      >
                        {startingId === assignment.id ? (
                          "Loading..."
                        ) : isLocked ? (
                          "Locked"
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Quest
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed History List */}
      <CompletedQuests 
        completedAssignments={allCompletedAssignments} 
        onStudy={handleOpenStudyDrawer}
      />

      <StudyDrawer 
        open={studyDrawerOpen}
        onOpenChange={setStudyDrawerOpen}
        quizId={studyQuizId}
        questTitle={studyQuestTitle}
      />
    </div>
  );
}
