"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { completeQuizSession } from "@/lib/actions/quiz";
import { QuizActiveView } from "./quiz-active-view";
import { QuizCompletionView } from "./quiz-completion-view";
import {
  calculatePoints,
  getRankLetter,
  getPersistedState,
  persistState,
  clearPersistedState,
} from "./quiz-utils";

interface QuizArenaProps {
  sessionId: string;
  userName: string;
  initialState: any; // { status: 'active' | 'completed', questions: [], score?: number }
}

export function QuizArena({ sessionId, userName, initialState }: QuizArenaProps) {
  const [allQuestions] = useState(initialState.questions || []);

  const [currentIndex, setCurrentIndex] = useState(() =>
    getPersistedState(`onboarding_quiz_${sessionId}_index`, 0)
  );
  
  const [score, setScore] = useState(() => {
    if (initialState.status === "completed" && initialState.score !== undefined) {
      return initialState.score;
    }
    return getPersistedState(`onboarding_quiz_${sessionId}_score`, 0);
  });

  const [isCompleted, setIsCompleted] = useState(initialState.status === "completed");

  useEffect(() => {
    if (!isCompleted) {
      persistState(`onboarding_quiz_${sessionId}_index`, currentIndex);
      persistState(`onboarding_quiz_${sessionId}_score`, score);
    }
  }, [currentIndex, score, sessionId, isCompleted]);

  const question = allQuestions[currentIndex];

  const [timeRemaining, setTimeRemaining] = useState(question?.timeLimit || 30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "correct" | "incorrect">("idle");

  const processAnswer = async (optionIndex: number | null) => {
    setIsSubmitting(true);
    
    // Stop the local tick
    const isCorrect = optionIndex !== null && optionIndex === question.correct_option_index;
    
    if (isCorrect) {
      setValidationStatus("correct");
      const { bonus, total } = calculatePoints(true, question.timeLimit, timeRemaining);
      
      setScore((s: number) => s + total);

      if (bonus > 0) {
        toast.success(`+${bonus} Speed Bonus! 🔥`, {
          style: { background: "#025c48", color: "#fff", border: "none" },
        });
      } else {
        toast.success("Correct!");
      }
    } else {
      setValidationStatus("incorrect");
    }

    // Short visual pause (800ms instead of 1.5s) to register the answer
    setTimeout(async () => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= allQuestions.length) {
        // Optimistically set completed state
        setIsCompleted(true);
        clearPersistedState(`onboarding_quiz_${sessionId}_index`);
        clearPersistedState(`onboarding_quiz_${sessionId}_score`);
        clearPersistedState(`onboarding_quiz_${sessionId}_q${question.id}_start`);

        // Push final score to server in background
        try {
          const finalScore = score + (isCorrect ? calculatePoints(true, question.timeLimit, timeRemaining).total : 0);
          await completeQuizSession(sessionId, finalScore);
        } catch (error) {
          console.error("Failed to save score", error);
          toast.error("Failed to save score on the server.");
        }
      } else {
        clearPersistedState(`onboarding_quiz_${sessionId}_q${question.id}_start`);
        setCurrentIndex(nextIndex);
        setSelectedOption(null);
        setValidationStatus("idle");
        setTimeRemaining(allQuestions[nextIndex].timeLimit || 30);
        setIsSubmitting(false);
      }
    }, 800);
  };

  const handleTimeUp = async () => {
    if (isSubmitting || isCompleted) return;
    toast.error("Time is up!");
    await processAnswer(null);
  };

  const handleOptionSelect = async (optionIndex: number) => {
    if (isSubmitting || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    await processAnswer(optionIndex);
  };

  if (isCompleted) {
    const rankLetter = getRankLetter(score);
    return (
      <QuizCompletionView
        score={score}
        rankLetter={rankLetter}
        userName={userName}
      />
    );
  }

  return (
    <QuizActiveView
      sessionId={sessionId}
      question={question}
      score={score}
      isSubmitting={isSubmitting}
      selectedOption={selectedOption}
      validationStatus={validationStatus}
      onOptionSelect={handleOptionSelect}
      onTimeUp={handleTimeUp}
      timeRemaining={timeRemaining}
      setTimeRemaining={setTimeRemaining}
    />
  );
}
