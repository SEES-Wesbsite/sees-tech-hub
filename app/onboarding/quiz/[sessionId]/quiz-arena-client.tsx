"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { completeQuizSession } from "@/lib/actions/quiz";
import { AdrenalineBar } from "@/components/quiz/adrenaline-bar";
import { Question } from "@/components/quiz/question";
import { OptionCard } from "@/components/quiz/option-card";
import { ShareableRankCard } from "@/components/quiz/shareable-rank-card";
import { captureAndShare } from "@/lib/utils/share";
import { TIER_THRESHOLDS } from "@/lib/constants";
import { Trophy, Loader2, Share2 } from "lucide-react";

interface QuizArenaProps {
  sessionId: string;
  userName: string;
  initialState: any; // { status: 'active' | 'completed', questions: [] }
}

export function QuizArenaClient({
  sessionId,
  userName,
  initialState,
}: QuizArenaProps) {
  const router = useRouter();

  // Client-Side Quiz State
  const [allQuestions] = useState(initialState.questions || []);

  const getInitialState = (key: string, fallback: number) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`onboarding_quiz_${sessionId}_${key}`);
      if (saved) return parseInt(saved, 10);
    }
    return fallback;
  };

  const [currentIndex, setCurrentIndex] = useState(() =>
    getInitialState("index", 0),
  );
  const [score, setScore] = useState(() => getInitialState("score", 0));

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `onboarding_quiz_${sessionId}_index`,
        currentIndex.toString(),
      );
      localStorage.setItem(
        `onboarding_quiz_${sessionId}_score`,
        score.toString(),
      );
    }
  }, [currentIndex, score, sessionId]);
  const [isCompleted, setIsCompleted] = useState(
    initialState.status === "completed",
  );

  const question = allQuestions[currentIndex];

  // Local UI State
  const [localTime, setLocalTime] = useState(question?.timeLimit || 30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "correct" | "incorrect"
  >("idle");

  const rankCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Helper to calculate Rank Letter based on score
  const getRankLetter = (s: number) => {
    if (s >= TIER_THRESHOLDS.S) return "S";
    if (s >= TIER_THRESHOLDS.A) return "A";
    if (s >= TIER_THRESHOLDS.B) return "B";
    if (s >= TIER_THRESHOLDS.C) return "C";
    if (s >= TIER_THRESHOLDS.D) return "D";
    return "E";
  };

  // 1. The Local Tick (Visual Pressure)
  useEffect(() => {
    if (isCompleted || isSubmitting || !question) return;

    setLocalTime(question.timeLimit); // Reset local time when a new question loads

    const interval = setInterval(() => {
      setLocalTime((prev: number) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }

        // Personalization: Hype them up when time is low
        if (prev === 10) {
          toast(`Clock is ticking, ${userName}!`, {
            icon: "⏳",
            style: { background: "#1a1a1a", border: "1px solid #333" },
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question?.id, isCompleted, isSubmitting]);

  // 2. Handle Time Up
  const handleTimeUp = async () => {
    if (isSubmitting || isCompleted) return;
    toast.error("Time is up!");
    await processAnswer(null);
  };

  // 3. Handle Option Click
  const handleOptionSelect = async (optionIndex: number) => {
    if (isSubmitting || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    await processAnswer(optionIndex);
  };

  // 4. Process the Answer (Pure Client-Side Zero Latency)
  const processAnswer = async (optionIndex: number | null) => {
    setIsSubmitting(true);

    // Evaluate answer instantly in memory
    const isCorrect =
      optionIndex !== null && optionIndex === question.correct_option_index;
    let pointsEarned = 0;

    if (isCorrect) {
      setValidationStatus("correct");
      // Speed Bonus Math: Max 50 points per question (30 base + up to 20 speed bonus)
      const timeSpent = question.timeLimit - localTime;
      const speedBonus = Math.max(
        0,
        Math.floor(
          ((question.timeLimit - timeSpent) / question.timeLimit) * 20,
        ),
      );
      pointsEarned = 30 + speedBonus;

      setScore((s) => s + pointsEarned);

      if (speedBonus > 0) {
        toast.success(`+${speedBonus} Speed Bonus! 🔥`, {
          style: { background: "#025c48", color: "#fff", border: "none" },
        });
      } else {
        toast.success("Correct!");
      }
    } else {
      setValidationStatus("incorrect");
    }

    // Visual Celebration Pause (1.5s)
    setTimeout(async () => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= allQuestions.length) {
        // Quiz is Over! Push final score to server.
        try {
          await completeQuizSession(sessionId, score + pointsEarned);
          if (typeof window !== "undefined") {
            localStorage.removeItem(`onboarding_quiz_${sessionId}_index`);
            localStorage.removeItem(`onboarding_quiz_${sessionId}_score`);
          }
          triggerCelebration();
          setIsCompleted(true);
        } catch (error) {
          console.error("Failed to complete quiz", error);
          toast.error("Failed to save score. Please check your connection.");
        }
      } else {
        // Instantly move to next question in memory!
        setCurrentIndex(nextIndex);
        setSelectedOption(null);
        setValidationStatus("idle");
        setIsSubmitting(false);
      }
    }, 1500);
  };

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#025c48", "#95fde2", "#ffffff"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#025c48", "#95fde2", "#ffffff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Phase 3: Celebration UI
  if (isCompleted) {
    const rankLetter = getRankLetter(score);

    const handleShare = async () => {
      setIsSharing(true);
      const success = await captureAndShare(
        rankCardRef.current,
        `SEES-Rank-${userName}.png`,
      );
      if (success) {
        toast.success("Image generated successfully!");
      }
      setIsSharing(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh] text-center relative"
      >
        <div className="w-24 h-24 rounded-full bg-brand/20 flex items-center justify-center shadow-[0_0_50px_rgba(2,92,72,0.6)] mb-4">
          <Trophy className="w-12 h-12 text-brand-light" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
          Run Complete!
        </h1>
        <p className="text-xl text-white/70 mb-8">
          You survived the Arena, {userName}.
        </p>

        <div className="bg-black/50 border border-white/10 rounded-3xl p-8 mb-8 w-full max-w-md backdrop-blur-md relative overflow-hidden">
          {/* Subtle Rank Glow inside the box */}
          <div className="absolute top-0 right-0 w-full h-full bg-brand/5 blur-3xl rounded-full" />

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-white/50 uppercase mb-2">
                Total Score
              </div>
              <div className="text-4xl font-black font-mono text-white">
                {score}
              </div>
            </div>
            <div className="text-center border-l border-white/10">
              <div className="text-sm font-bold text-white/50 uppercase mb-2">
                Final Rank
              </div>
              <div className="text-4xl font-black font-serif text-brand-light">
                {rankLetter}-Rank
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isSharing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            Share to Social
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 rounded-xl bg-brand/10 border border-brand hover:bg-brand/20 text-brand-light font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
          >
            Enter the Hub
          </button>
        </div>

        {/* Hidden Rank Card for HTML-to-Image rendering */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <ShareableRankCard
            ref={rankCardRef}
            userName={userName}
            score={score}
            rankLetter={rankLetter}
          />
        </div>
      </motion.div>
    );
  }

  // Loading State
  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Phase 2: Active Arena UI
  const labels = ["A", "B", "C", "D", "E", "F"];

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
          timeRemaining={localTime}
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
                let status: "idle" | "selected" | "correct" | "incorrect" =
                  "idle";

                if (isSubmitting) {
                  if (selectedOption === index) {
                    if (validationStatus === "correct") status = "correct";
                    else if (validationStatus === "incorrect")
                      status = "incorrect";
                    else status = "selected";
                  } else if (
                    isSubmitting &&
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
                    onClick={() => handleOptionSelect(index)}
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
