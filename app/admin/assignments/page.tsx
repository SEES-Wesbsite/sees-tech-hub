import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssignmentsClient } from "./assignments-client";
import { getCurrentWeekMonday } from "@/lib/utils";

export const metadata = {
  title: "Quest Assignments | Admin",
};

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Admin check
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const targetMonday = getCurrentWeekMonday();

  // Fetch all users with their assignments for the target week
  // And fetch their total points to show their rank.
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      full_name,
      avatar_url,
      total_points,
      primary_stacks,
      quest_assignments (
        id,
        status,
        quest_bank (
          id,
          title,
          difficulty,
          quest_type
        )
      )
    `)
    // We can't easily filter the nested relation on week_start in standard postgrest without eq on the embedded resource.
    // Instead we fetch all users and their assignments for that week explicitly using string matching.
    .eq('quest_assignments.week_start', targetMonday);

  // But Supabase JS eq on nested relations doesn't always work perfectly for top-level filtering if we want ALL users.
  // Actually, if we use eq('quest_assignments.week_start', nextMonday), it filters the nested array! Which is perfect.

  if (error) {
    console.error("Error fetching assignments data:", error);
  }

  return (
    <div className="w-full">
      <AssignmentsClient 
        users={(users as any) || []} 
        targetWeekStart={targetMonday} 
      />
    </div>
  );
}
