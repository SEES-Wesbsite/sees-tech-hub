import { createClient } from "@/lib/supabase/server";
import { ClientDock } from "@/components/layout/client-dock";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, onboarding_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.onboarding_status !== "completed") {
    redirect("/onboarding");
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-brand selection:text-[#95fde2]">
      {/* Main Content Area */}
      <main className="w-full min-h-screen pb-32 relative z-10 max-w-5xl mx-auto">
        {children}
      </main>

      {/* Global Dock Navigation */}
      <ClientDock isAdmin={isAdmin} />
    </div>
  );
}
