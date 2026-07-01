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
    // Layout handles redirecting to onboarding if profile is missing,
    // but Next.js parallel fetching means we just throw or return null here
    throw new Error("Profile not found");
  }

  // 3. Fetch all other data concurrently for performance
  const [
    { data: activeQuests },
    { count: questsCompleted },
    { count: eventsRSVPd },
    { data: leaderboard },
    { data: recommendedOpportunities },
    { data: upcomingEvents }
  ] = await Promise.all([
    // Active Quests
    supabase.from("quest_bank").select("*").eq("status", "active").order("created_at", { ascending: false }),
    // KPI: Quests Completed
    supabase.from("quest_completions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "approved"),
    // KPI: Events RSVP'd
    supabase.from("event_rsvps").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    // Leaderboard (Top 10)
    supabase.from("users").select("id, full_name, preferred_name, avatar_url, total_points").order("total_points", { ascending: false }).limit(10),
    // Recommended Opportunities (approved only, latest 5)
    supabase.from("opportunities").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(5),
    // Upcoming Events (latest 5)
    supabase.from("events").select("*").gte("start_time", new Date().toISOString()).order("start_time", { ascending: true }).limit(5)
  ]);

  return (
    <div className="min-h-screen relative">
      <DashboardClient 
        profile={profile} 
        activeQuests={activeQuests || []} 
        kpis={{
          questsCompleted: questsCompleted || 0,
          eventsRSVPd: eventsRSVPd || 0
        }}
        leaderboard={leaderboard || []}
        recommendedOpportunities={recommendedOpportunities || []}
        upcomingEvents={upcomingEvents || []}
      />
    </div>
  );
}
