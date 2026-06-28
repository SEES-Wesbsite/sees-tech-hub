import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic"; // Ensure fresh data on dashboard load

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Authenticate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch Profile & Onboarding Verification
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(
      "id, full_name, preferred_name, avatar_url, primary_stacks, total_points, role, onboarding_status, created_at, portfolio_link, social_link",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // If somehow no profile, redirect to login
    redirect("/login");
  }

  if (profile.onboarding_status !== "completed") {
    // Failsafe redirect if they bypass middleware
    redirect("/onboarding");
  }

  // 3. Fetch Active Quests
  const { data: activeQuests, error: questsError } = await supabase
    .from("quest_bank")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // 4. (Future) Fetch recent activity or leaderboard data here
  // const { data: recentActivity } = ...

  return (
    <div className="min-h-screen relative">
      <DashboardClient profile={profile} activeQuests={activeQuests || []} />
    </div>
  );
}
