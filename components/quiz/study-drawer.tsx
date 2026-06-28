"use client";

import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

interface StudyDrawerProps {
  quizId: string | null;
  questTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyDrawer({ quizId, questTitle, open, onOpenChange }: StudyDrawerProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && quizId) {
      fetchQuestions();
    }
  }, [open, quizId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    // We only have the quizId. We need to fetch questions that belong to this quiz.
    // Assuming quiz_questions has a quiz_id foreign key, OR quiz table has question_ids.
    // Let's check how getQuizState does it. It fetches from quiz_sessions.question_ids.
    // But since we are studying the base quiz, we can fetch from quiz_questions where quiz_id = quizId.
    
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, question_text, options, correct_option_index')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true }); // Or order by some index if exists

    if (data) {
      setQuestions(data);
    }
    setIsLoading(false);
  };

  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[96vh]">
        <div className="mx-auto w-full max-w-3xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-serif">{questTitle} - Study Guide</DrawerTitle>
            <DrawerDescription>
              Review the questions and correct answers for this completed quest.
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="h-[70vh] px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
              </div>
            ) : !quizId ? (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-3xl">
                This quest was not a quiz. No study guide available.
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-3xl">
                No questions found for this quiz.
              </div>
            ) : (
              <div className="space-y-8 pb-10 mt-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-foreground/5 border border-border/50 rounded-3xl p-6">
                    <div className="flex gap-4">
                      <div className="text-brand font-bold text-lg shrink-0">Q{idx + 1}.</div>
                      <div className="w-full">
                        <p className="text-lg text-foreground font-medium mb-6">
                          {q.question_text}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isCorrect = optIdx === q.correct_option_index;
                            
                            return (
                              <div 
                                key={optIdx}
                                className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                                  isCorrect 
                                    ? "bg-success/10 border-success text-success" 
                                    : "bg-foreground/5 border-foreground/10 text-muted-foreground"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0
                                  ${isCorrect ? "bg-success text-success-foreground" : "bg-foreground/20 text-muted-foreground"}
                                `}>
                                  {labels[optIdx]}
                                </div>
                                <span className="font-medium">{opt}</span>
                                {isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DrawerFooter className="border-t border-border mt-auto pt-4 flex-row justify-end">
            <DrawerClose asChild>
              <Button variant="outline" className="px-8">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
