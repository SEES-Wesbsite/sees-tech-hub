import { createAdminClient } from "@/lib/supabase/server";
import { HackathonJobBoard } from "@/components/admin/hackathon-job-board";

export const dynamic = "force-dynamic";

export default async function AdminHackathonPage() {
  const supabase = await createAdminClient();
  
  // Fetch all submissions, sorted by score descending
  const { data: submissions } = await supabase
    .from("hackathon_submissions")
    .select("*")
    .order("total_score", { ascending: false })
    .order("created_at", { ascending: false });

  // Get current admin ID
  const { data: authData } = await supabase.auth.getUser();
  let adminId = null;
  let myReviews = [];

  if (authData.user) {
    const { data: adminUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", authData.user.email)
      .single();
      
    if (adminUser) {
      adminId = adminUser.id;
      // Fetch reviews made by this admin
      const { data } = await supabase
        .from("hackathon_reviews")
        .select("*")
        .eq("admin_id", adminId);
      myReviews = data || [];
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hackathon Submissions</h1>
          <p className="text-sm text-slate-500">Review and score concept notes.</p>
        </div>
      </div>
      <HackathonJobBoard 
        initialSubmissions={submissions || []} 
        initialReviews={myReviews} 
        adminId={adminId} 
      />
    </div>
  );
}
