"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePersona, startPlacementQuiz } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  ArrowRight,
  Code2,
  Database,
  Layout,
  Smartphone,
  BrainCircuit,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "persona" | "hype" | "quiz" | "celebration";

const STACK_OPTIONS = [
  { id: "Frontend", icon: Layout, label: "Frontend" },
  { id: "Backend", icon: Database, label: "Backend" },
  { id: "Fullstack", icon: Code2, label: "Fullstack" },
  { id: "AI/ML", icon: BrainCircuit, label: "AI/ML" },
  { id: "Mobile", icon: Smartphone, label: "Mobile" },
  { id: "Product/Design", icon: Users, label: "Product/UI" },
];

export function OnboardingClient({
  initialStep,
  defaultName,
}: {
  initialStep: Step;
  defaultName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persona State
  const [name, setName] = useState(defaultName);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const handleStackToggle = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId)
        ? prev.filter((id) => id !== stackId)
        : [...prev, stackId],
    );
  };

  const handlePersonaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedStacks.length === 0) {
      setError("Please fill out both fields to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("preferred_name", name);
      formData.append("primary_stacks", JSON.stringify(selectedStacks));

      await updatePersona(formData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const { sessionId } = await startPlacementQuiz();
      // We will route to the actual quiz UI or switch state.
      // For now, let's pretend we move to the quiz state and pass the sessionId.
      // Actually, since the quiz logic is complex, maybe it should be its own route?
      // "router.push(`/onboarding/quiz/${sessionId}`)"
      // Let's route them to the specific quiz session page so they can refresh safely.
      router.push(`/onboarding/quiz/${sessionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start quiz");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "persona" && (
        <motion.div
          key="persona"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-glass-heavy border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
              Welcome to the Hub
            </h1>
            <p className="text-white/60">Let's set up your builder persona.</p>
          </div>

          <form onSubmit={handlePersonaSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-light uppercase tracking-wider block">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                placeholder="Your preferred name"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-light uppercase tracking-wider block">
                Your Primary Focus (Select all that apply)
              </label>
              <p className="text-xs text-white/50 mb-4">
                This helps us match you with the right Hackathon squads.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STACK_OPTIONS.map((stack) => {
                  const Icon = stack.icon;
                  const isSelected = selectedStacks.includes(stack.id);
                  return (
                    <button
                      key={stack.id}
                      type="button"
                      onClick={() => handleStackToggle(stack.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? "bg-brand/20 border-brand text-brand-light shadow-[0_0_15px_rgba(2,92,72,0.3)]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-xs font-semibold">
                        {stack.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/20 text-destructive-foreground text-sm border border-destructive/30 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="default"
              size="lg"
              className="w-full h-14 rounded-xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? <Loader className="w-6 h-6 mr-2" /> : "Continue"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
