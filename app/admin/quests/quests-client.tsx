"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FilePlus, Edit2, Archive, ArchiveRestore } from "lucide-react";
import { Quest, Quiz } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateQuestDrawer } from "./create-quest-drawer";
import { EditQuestDrawer } from "./edit-quest-drawer";
import { GenerateQuestDrawer } from "./generate-quest-drawer";
import { archiveQuest, unarchiveQuest, publishAllDrafts } from "@/app/actions/admin-quests";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function QuestsClient({
  initialQuests,
  quizzes,
}: {
  initialQuests: Quest[];
  quizzes: Quiz[];
}) {
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const handleEditClick = (quest: Quest) => {
    setEditingQuest(quest);
    setIsEditDrawerOpen(true);
  };

  const handleArchive = async (id: string) => {
    await archiveQuest(id);
    // Page will be revalidated by the server action
  };

  const handleUnarchive = async (id: string) => {
    await unarchiveQuest(id);
    // Page will be revalidated by the server action
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const handlePublishDrafts = async () => {
    setIsPublishing(true);
    await publishAllDrafts();
    setIsPublishing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground flex items-center gap-3">
            <FilePlus className="w-8 h-8 text-brand" />
            Quest Bank
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the permanent library of quests.
          </p>
        </motion.div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted/50">
                Actions
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-2">
              <Button 
                variant="ghost" 
                onClick={handlePublishDrafts} 
                disabled={isPublishing}
                className="w-full justify-start hover:bg-brand/10 hover:text-brand"
              >
                {isPublishing ? 'Publishing...' : 'Publish All Drafts'}
              </Button>
            </PopoverContent>
          </Popover>
          <GenerateQuestDrawer />
          <CreateQuestDrawer quizzes={quizzes} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-border/50">
        {initialQuests.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground font-medium">
            No quests found in the bank.
          </div>
        ) : (
          initialQuests.map((quest) => (
            <div key={quest.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 hover:bg-muted/10 transition-colors gap-4">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-foreground text-base">
                    {quest.title}
                  </span>
                  <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20">
                    {quest.quest_type.replace("_", " ")}
                  </Badge>
                  <span className="font-serif font-bold text-foreground text-sm border-l pl-2 border-border/50">
                    {quest.difficulty}-Rank
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={
                      quest.status === "active"
                        ? "bg-success/10 text-success"
                        : quest.status === "draft"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {quest.status}
                  </Badge>
                  <span>•</span>
                  <span>{quest.point_value} XP</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditClick(quest)}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {quest.status !== "archived" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Archive"
                        className="hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive this quest?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will archive "{quest.title}". It will no longer be assignable to users.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleArchive(quest.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUnarchive(quest.id)}
                    title="Unarchive"
                    className="hover:text-success hover:bg-success/10 hover:border-success/30"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <EditQuestDrawer
        quest={editingQuest}
        quizzes={quizzes}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
      />
    </div>
  );
}
