"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface CompletedQuestsProps {
  completedAssignments: any[];
  onStudy: (quizId: string | null, title: string) => void;
}

export function CompletedQuests({ completedAssignments, onStudy }: CompletedQuestsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(completedAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = completedAssignments.slice(startIndex, startIndex + itemsPerPage);

  if (completedAssignments.length === 0) {
    return null; // Don't show the section if they haven't completed any quests ever
  }

  return (
    <div className="mt-12 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground">Completed Quests</h3>
        <p className="text-muted-foreground text-sm mt-1">Your entire history of completed quests across the hub.</p>
      </div>

      <div className="space-y-4">
        {currentItems.map((assignment) => {
          const quest = assignment.quest_bank;
          return (
            <div 
              key={assignment.id} 
              onClick={() => onStudy(quest.quiz_id, quest.title)}
              className="bg-foreground/5 border border-border/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-foreground/10 hover:border-brand/30 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-foreground">{quest.title}</h4>
                    <Badge variant="outline" className="bg-background/50 text-[10px] capitalize">
                      {quest.quest_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{quest.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                <span className="font-mono font-bold text-brand text-sm">+{quest.point_value} XP</span>
                <span className="text-xs text-muted-foreground/70 font-medium">
                  {assignment.completed_at ? format(new Date(assignment.completed_at), "MMM d, yyyy • h:mm a") : "Completed"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
