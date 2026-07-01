import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Authenticate & Verify Admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // 2. Fetch KPIs
  const [
    { count: totalUsers },
    { count: pendingOpportunities },
    { count: totalRSVPs },
    { data: needsAttention },
    { data: recentUsers }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("event_rsvps").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*").eq("status", "pending_review").order("created_at", { ascending: false }).limit(5),
    supabase.from("users").select("id, full_name, preferred_name, avatar_url, created_at").order("created_at", { ascending: false }).limit(10)
  ]);

  // 3. For the chart: Users signed up in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: recentSignups } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Aggregate signups by day
  const signupsByDay = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      users: recentSignups?.filter(u => u.created_at.startsWith(dateStr)).length || 0
    };
  });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Platform health, pending reviews, and recent activity.</p>
        </div>
      </div>
      
      <AdminDashboardClient 
        kpis={{
          totalUsers: totalUsers || 0,
          pendingOpportunities: pendingOpportunities || 0,
          totalRSVPs: totalRSVPs || 0,
        }}
        needsAttention={needsAttention || []}
        recentUsers={recentUsers || []}
        chartData={signupsByDay}
      />
    </div>
  );
}
