"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { Trophy, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ShareableRankCard } from "@/components/quiz/shareable-rank-card";
import { captureAndShare } from "@/lib/utils/share";
import { RANK_TITLES } from "./quiz-constants";

interface QuizCompletionViewProps {
  score: number;
  rankLetter: string;
  userName: string;
}

export function QuizCompletionView({
  score,
  rankLetter,
  userName,
}: QuizCompletionViewProps) {
  const router = useRouter();
  const rankCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Trigger confetti immediately on mount
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
  }, []);

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

  const title = RANK_TITLES[rankLetter] || RANK_TITLES['E'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh] text-center relative"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-brand/20 flex items-center justify-center shadow-[0_0_50px_rgba(2,92,72,0.6)] mb-4"
      >
        <Trophy className="w-12 h-12 text-brand-light" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-4xl md:text-5xl font-serif font-bold mb-2"
      >
        Quiz Completed!
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-white/70 mb-8"
      >
        You have finished the quiz, {userName}.
      </motion.p>

      <motion.div
        initial={{ y: 100, opacity: 0, rotateX: 45 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.7 }}
        className="bg-black/50 border border-white/10 rounded-3xl p-8 mb-8 w-full max-w-md backdrop-blur-md relative overflow-hidden"
        style={{ perspective: "1000px" }}
      >
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
              {rankLetter} Rank
            </div>
            <div className="text-xs text-brand-light/70 mt-1 uppercase tracking-wider font-bold">
              {title}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
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
      </motion.div>

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
