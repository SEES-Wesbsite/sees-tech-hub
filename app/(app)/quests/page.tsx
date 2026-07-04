import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserQuestsClient } from "./quests-client";
import { getCurrentWeekMonday } from "@/lib/utils";
import { ComingSoon } from "./coming-soon";

export const metadata = {
  title: "My Quests",
  description:
    "Complete your Weekly 3 assignments to earn XP and level up your rank.",
  openGraph: {
    title: "My Quests | SEES Tech Hub",
    description:
      "Complete your Weekly 3 assignments to earn XP and level up your rank.",
    images: [
      "/api/og/default?title=My%20Quests&description=Complete%20assignments%20to%20earn%20XP%20and%20level%20up.",
    ],
  },
  twitter: {
    images: [
      "/api/og/default?title=My%20Quests&description=Complete%20assignments%20to%20earn%20XP%20and%20level%20up.",
    ],
  },
};

export default async function UserQuestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const targetMonday = getCurrentWeekMonday();

  // Fetch the user's weekly assignments (only active ones for this week)
  const { data: weeklyAssignmentsRaw } = await supabase
    .from("quest_assignments")
    .select(
      `
      id,
      status,
      assigned_at,
      completed_at,
      quest_bank (
        id,
        title,
        description,
        quest_type,
        difficulty,
        point_value,
        tags,
        external_url
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("week_start", targetMonday)
    .order("assigned_at", { ascending: true })
    .limit(3);

  const weeklyAssignments = weeklyAssignmentsRaw || [];

  // Fetch all completed assignments for the user's history
  const { data: allCompletedAssignments } = await supabase
    .from("quest_assignments")
    .select(
      `
      id,
      status,
      completed_at,
      quest_bank (
        id,
        title,
        description,
        quest_type,
        difficulty,
        point_value,
        tags,
        external_url
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  // Fetch all active quests in the platform
  const { data: activeQuests } = await supabase
    .from("quest_bank")
    .select("*")
    .eq("status", "active");

  const completedQuestIds = new Set(
    (allCompletedAssignments || []).map((a) => (a.quest_bank as any).id),
  );

  // Filter out completed quests
  let allQuests = (activeQuests || []).filter(
    (q) => !completedQuestIds.has(q.id),
  );

  // Determine user rank and stacks for personalization
  const calculateRank = (points: number) => {
    if (points >= 10000) return "S";
    if (points >= 5000) return "A";
    if (points >= 2500) return "B";
    if (points >= 1000) return "C";
    if (points >= 500) return "D";
    return "E";
  };

  const getDifficultyDistance = (userRank: string, questDiff: string) => {
    const ranks = ["E", "D", "C", "B", "A", "S"];
    const uIdx = ranks.indexOf(userRank);
    const qIdx = ranks.indexOf(questDiff);
    return Math.abs(uIdx - qIdx);
  };

  const userRank = calculateRank(profile?.total_points || 0);
  const userStacks: string[] = profile?.primary_stacks || [];

  // Sort global bank by familiarity
  allQuests = allQuests
    .map((quest) => {
      let score = 0;
      let matches = 0;

      // Tag matching (+10 per matched tag)
      if (quest.tags && quest.tags.length > 0) {
        matches = quest.tags.filter((t: string) =>
          userStacks.includes(t),
        ).length;
        score += matches * 10;
      }

      // Difficulty matching (+20 exact, +5 for 1 tier difference)
      const diffDist = getDifficultyDistance(userRank, quest.difficulty);
      if (diffDist === 0) score += 20;
      else if (diffDist === 1) score += 5;
      else score -= diffDist * 5;

      const isPerfectMatch = diffDist === 0 && matches > 0;

      return { ...quest, score, isPerfectMatch };
    })
    .sort((a, b) => b.score - a.score);

  if (true) {
    return <ComingSoon />;
  }

  return (
    <main className="w-full relative min-h-screen">
      {/* Dynamic Light Rays Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-brand-dark/10 blur-[150px] mix-blend-screen opacity-50" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground drop-shadow-2xl">
            My <span className="text-gradient">Quests</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
            Complete your Weekly 3 assignments to earn XP and level up your
            rank.
          </p>
        </div>

        <UserQuestsClient
          weeklyAssignments={weeklyAssignments}
          allCompletedAssignments={allCompletedAssignments || []}
          allQuests={allQuests}
        />
      </div>
    </main>
  );
}
