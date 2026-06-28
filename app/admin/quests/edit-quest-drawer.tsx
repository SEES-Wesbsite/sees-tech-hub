"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  updateQuest,
  archiveQuest,
  unarchiveQuest,
} from "@/app/actions/admin-quests";
import { Quest, Quiz } from "@/lib/types";
import { Loader } from "@/components/ui/loader";
import { Trash2 } from "lucide-react";
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

interface EditQuestDrawerProps {
  quest: Quest | null;
  quizzes: Quiz[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditQuestDrawer({
  quest,
  quizzes,
  open,
  onOpenChange,
}: EditQuestDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questType, setQuestType] = useState("dsa_problem");
  const [difficulty, setDifficulty] = useState("E");
  const [pointValue, setPointValue] = useState("10");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [quizId, setQuizId] = useState("");

  // Sync prop to state when drawer opens
  useEffect(() => {
    if (quest && open) {
      setTitle(quest.title);
      setDescription(quest.description);
      setQuestType(quest.quest_type);
      setDifficulty(quest.difficulty);
      setPointValue(quest.point_value.toString());
      setTags(quest.tags ? quest.tags.join(", ") : "");
      setExternalUrl(quest.external_url || "");
      setQuizId(quest.quiz_id || "");
      setError(null);
    }
  }, [quest, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quest) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("questType", questType);
    formData.append("difficulty", difficulty);
    formData.append("pointValue", pointValue);
    formData.append("tags", tags);
    if (externalUrl) formData.append("externalUrl", externalUrl);
    if (quizId) formData.append("quizId", quizId);

    const result = await updateQuest(quest.id, formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      onOpenChange(false);
    }
  };

  const handleArchive = async () => {
    if (!quest) return;

    setIsArchiving(true);
    setError(null);

    const result = await archiveQuest(quest.id);
    setIsArchiving(false);

    if (result.error) {
      setError(result.error);
    } else {
      onOpenChange(false);
    }
  };

  const handleUnarchive = async () => {
    if (!quest) return;

    setIsArchiving(true); // Reusing the same loading state
    setError(null);

    const result = await unarchiveQuest(quest.id);
    setIsArchiving(false);

    if (result.error) {
      setError(result.error);
    } else {
      onOpenChange(false);
    }
  };

  if (!quest) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Edit Quest</DrawerTitle>
            <DrawerDescription>
              Update quest details or change its status.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[65vh] px-4 overflow-y-auto scrollbar-hide">
            <form
              id="edit-quest-form"
              onSubmit={handleSubmit}
              className="space-y-8 pb-8"
            >
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">Basic Details</h4>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Solve Two Sum"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Markdown)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what needs to be done..."
                    required
                    className="min-h-[100px] resize-y"
                  />
                </div>
              </div>

              {/* Gamification */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">Gamification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="questType">Quest Type</Label>
                    <Select value={questType} onValueChange={setQuestType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dsa_problem">DSA Problem</SelectItem>
                        <SelectItem value="project_build">
                          Project Build
                        </SelectItem>
                        <SelectItem value="article_read">Article Read</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty / Rank</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">S-Rank</SelectItem>
                        <SelectItem value="A">A-Rank</SelectItem>
                        <SelectItem value="B">B-Rank</SelectItem>
                        <SelectItem value="C">C-Rank</SelectItem>
                        <SelectItem value="D">D-Rank</SelectItem>
                        <SelectItem value="E">E-Rank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointValue">XP Points</Label>
                    <Input
                      id="pointValue"
                      type="number"
                      value={pointValue}
                      onChange={(e) => setPointValue(e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (CSV)</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="react, python"
                    />
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">Resources</h4>

              {questType === "quiz" ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-quizId">Linked Quiz</Label>
                  <Select value={quizId} onValueChange={setQuizId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-externalUrl">External URL</Label>
                  <Input
                    id="edit-externalUrl"
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                  />
                </div>
              )}
              </div>
            </form>
          </ScrollArea>
          <DrawerFooter className="flex-row justify-between border-t border-border mt-auto pt-4">
            {quest.status !== "archived" ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isArchiving}
                  >
                    {isArchiving ? (
                      <Loader className="w-4 h-4 mr-2" variant="simple-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive this quest?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive "{quest.title}". It will no longer be
                      assignable.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleArchive}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      Archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleUnarchive}
                disabled={isArchiving}
              >
                {isArchiving ? (
                  <Loader className="w-4 h-4 mr-2" variant="simple-spin" />
                ) : null}
                Unarchive
              </Button>
            )}
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button
                type="submit"
                form="edit-quest-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2" variant="simple-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
