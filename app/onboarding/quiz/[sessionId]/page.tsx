import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuizState } from "@/lib/actions/quiz";
import { QuizArenaClient } from "./quiz-arena-client";

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { sessionId } = await params;

  try {
    // getQuizState handles authorization and returns the initial state securely
    const initialState = await getQuizState(sessionId);

    // Also fetch user's preferred name for dynamic personalization
    const { data: profile } = await supabase
      .from("users")
      .select("preferred_name, full_name")
      .eq("id", user.id)
      .single();

    const userName =
      profile?.preferred_name || profile?.full_name?.split(" ")[0] || "Builder";

    return (
      <div className="min-h-screen bg-[#010907] text-white overflow-hidden relative">
        {/* Arena Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-brand-dark/10 blur-[150px] mix-blend-screen opacity-50" />
          <div className="absolute bottom-[-30%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-brand-light/5 blur-[120px] mix-blend-screen opacity-50" />
        </div>

        <div className="relative z-10 w-full min-h-screen flex flex-col pt-10 pb-20 px-4 md:px-8">
          <QuizArenaClient
            sessionId={sessionId}
            initialState={initialState}
            userName={userName}
          />
        </div>
      </div>
    );
  } catch (err: any) {
    console.error("Failed to load quiz session", err);
    notFound();
  }
}
