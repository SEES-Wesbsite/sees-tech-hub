"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import { useLocalStorageState } from "@/hooks/use-local-storage";
import { createQuest } from "@/app/actions/admin-quests";
import { Quiz } from "@/lib/types";
import { Plus } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export function CreateQuestDrawer({ quizzes }: { quizzes: Quiz[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle, clearTitle] = useLocalStorageState(
    "draft-quest-title",
    "",
  );
  const [description, setDescription, clearDesc] = useLocalStorageState(
    "draft-quest-desc",
    "",
  );
  const [questType, setQuestType, clearType] = useLocalStorageState(
    "draft-quest-type",
    "dsa_problem",
  );
  const [difficulty, setDifficulty, clearDiff] = useLocalStorageState(
    "draft-quest-diff",
    "E",
  );
  const [pointValue, setPointValue, clearPoints] = useLocalStorageState(
    "draft-quest-points",
    "10",
  );
  const [tags, setTags, clearTags] = useLocalStorageState(
    "draft-quest-tags",
    "",
  );
  const [externalUrl, setExternalUrl, clearUrl] = useLocalStorageState(
    "draft-quest-url",
    "",
  );
  const [quizId, setQuizId, clearQuiz] = useLocalStorageState(
    "draft-quest-quiz",
    "",
  );

  const handleClearDraft = () => {
    clearTitle();
    clearDesc();
    clearType();
    clearDiff();
    clearPoints();
    clearTags();
    clearUrl();
    clearQuiz();
    setTitle("");
    setDescription("");
    setQuestType("dsa_problem");
    setDifficulty("E");
    setPointValue("10");
    setTags("");
    setExternalUrl("");
    setQuizId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const result = await createQuest(formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      handleClearDraft();
      setOpen(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          title="Create Manual Quest"
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-xl shadow-brand/20 bg-brand text-brand-foreground hover:bg-brand/90 flex items-center justify-center p-0 transition-transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
          <span className="sr-only">Create Manual Quest</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Create New Quest</DrawerTitle>
            <DrawerDescription>
              Draft your quest here. It will be saved automatically to your
              browser.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[65vh] px-4 overflow-y-auto scrollbar-hide">
            <form
              id="create-quest-form"
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
                  <Label htmlFor="quizId">Linked Quiz</Label>
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
                  <Label htmlFor="externalUrl">External URL</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    value={externalUrl}
                  />
                </div>
              )}
              </div>
            </form>
          </ScrollArea>
          <DrawerFooter className="flex-row justify-between border-t border-border mt-auto pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearDraft}
              className="text-muted-foreground"
            >
              Clear Draft
            </Button>
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button
                type="submit"
                form="create-quest-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2" variant="simple-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Quest"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
