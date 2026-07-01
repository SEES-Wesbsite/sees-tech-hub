"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AdrenalineBar } from "@/components/quiz/adrenaline-bar";
import { Question } from "@/components/quiz/question";
import { OptionCard } from "@/components/quiz/option-card";
import { useEffect } from "react";
import { persistState, getPersistedState } from "./quiz-utils";

interface QuizActiveViewProps {
  sessionId: string;
  question: any;
  score: number;
  isSubmitting: boolean;
  selectedOption: number | null;
  validationStatus: "idle" | "correct" | "incorrect";
  onOptionSelect: (index: number) => void;
  onTimeUp: () => void;
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
}

export function QuizActiveView({
  sessionId,
  question,
  score,
  isSubmitting,
  selectedOption,
  validationStatus,
  onOptionSelect,
  onTimeUp,
  timeRemaining,
  setTimeRemaining,
}: QuizActiveViewProps) {
  const labels = ["A", "B", "C", "D", "E", "F"];

  // Handle local tick strictly based on time started to avoid refresh exploit
  useEffect(() => {
    if (isSubmitting || !question) return;

    // Track when this question actually started
    const timerKey = `onboarding_quiz_${sessionId}_q${question.id}_start`;
    let startedAt = getPersistedState<number | null>(timerKey, null);
    
    if (!startedAt) {
      startedAt = Date.now();
      persistState(timerKey, startedAt);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startedAt!) / 1000);
      const remaining = Math.max(0, question.timeLimit - elapsedSeconds);
      
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 250); // Frequent tick for accurate timing, but we only calculate integer seconds

    return () => clearInterval(interval);
  }, [question?.id, isSubmitting, sessionId]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold tracking-widest text-white/50 uppercase">
            Q {question.index + 1}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-full px-5 py-2 backdrop-blur-md">
          <span className="text-xs font-bold text-brand-light uppercase tracking-widest">
            Score
          </span>
          <span className="font-mono font-bold text-lg">{score}</span>
        </div>
      </div>

      {/* Adrenaline Bar */}
      <div className="mb-10 w-full max-w-3xl mx-auto">
        <AdrenalineBar
          totalTime={question.timeLimit || 30}
          timeRemaining={timeRemaining}
          isPaused={isSubmitting}
        />
      </div>

      {/* The Question Loader */}
      <AnimatePresence mode="wait">
        <motion.div key={question.id} className="w-full">
          <Question
            id={question.id}
            text={question.text}
            codeSnippet={undefined}
            theme="dark"
            animationStyle="slide"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {question.options.map((option: string, index: number) => {
                let status: "idle" | "selected" | "correct" | "incorrect" = "idle";

                if (isSubmitting) {
                  if (selectedOption === index) {
                    if (validationStatus === "correct") status = "correct";
                    else if (validationStatus === "incorrect") status = "incorrect";
                    else status = "selected";
                  } else if (
                    validationStatus === "incorrect" &&
                    index === question.correct_option_index
                  ) {
                    // Subtly highlight the correct answer if the user failed
                    status = "correct";
                  }
                }

                return (
                  <OptionCard
                    key={`${question.id}-${index}`}
                    id={index.toString()}
                    label={labels[index]}
                    content={option}
                    status={status}
                    isDisabled={isSubmitting}
                    onClick={() => onOptionSelect(index)}
                  />
                );
              })}
            </div>
          </Question>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
