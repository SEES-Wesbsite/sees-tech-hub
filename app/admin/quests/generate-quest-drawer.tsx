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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateQuestsFromAI } from "@/app/actions/admin-quests";
import { Sparkles, Loader2 } from "lucide-react";
import { useLocalStorageState } from "@/hooks/use-local-storage";

export function GenerateQuestDrawer() {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [prompt, setPrompt, clearPrompt] = useLocalStorageState(
    "draft-ai-prompt",
    "",
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    const result = await generateQuestsFromAI(prompt);

    setIsGenerating(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(
        `Successfully generated ${result.count} quests! They are saved as drafts in the table below.`,
      );
      clearPrompt();
      setPrompt("");
      // Auto close after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 2500);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-brand/30 hover:bg-brand/10 text-brand"
        >
          <Sparkles className="w-4 h-4" /> AI Generation Hub
        </Button>
      </DrawerTrigger>
      <DrawerContent className="">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" /> Generate Quests with
              AI
            </DrawerTitle>
            <DrawerDescription>
              Paste a LeetCode URL, a technical article, or describe the exact
              quests you want to generate. The AI will parse your instructions,
              assign appropriate difficulties, and strict-match tags to existing
              user profiles.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[50vh] px-4">
            <form
              id="generate-quest-form"
              onSubmit={handleGenerate}
              className="space-y-4 pb-6 mt-4"
            >
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-success/10 border border-success text-success rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Generate 3 intermediate Python quests focusing on data structures. Also, parse this URL: https://leetcode.com/problems/two-sum"
                  required
                  className="min-h-[250px] resize-none text-base p-4 leading-relaxed"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: The AI only has access to tags currently used by users in
                  the platform (e.g. 'python', 'react'). It will automatically
                  save generated quests as <strong>drafts</strong> so you can
                  review them.
                </p>
              </div>
            </form>
          </ScrollArea>
          <DrawerFooter className="flex-row justify-between border-t border-border mt-auto pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={clearPrompt}
              className="text-muted-foreground"
            >
              Clear Draft
            </Button>
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" disabled={isGenerating}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                form="generate-quest-form"
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Quests
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
