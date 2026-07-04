import { createClient } from "@/lib/supabase/server";
import { OpportunitiesFeedClient } from "./opportunities-feed-client";
import { Opportunity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ComingSoon } from "./coming-soon";

export const metadata = {
  title: "Opportunities",
  description:
    "Find personalized career and academic opportunities curated for you.",
  openGraph: {
    title: "Opportunities | SEES Tech Hub",
    description:
      "Find personalized career and academic opportunities curated for you.",
    images: [
      "/api/og/default?title=Opportunities&description=Curated%20internships,%20hackathons,%20and%20scholarships.",
    ],
  },
  twitter: {
    images: [
      "/api/og/default?title=Opportunities&description=Curated%20internships,%20hackathons,%20and%20scholarships.",
    ],
  },
};

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch approved opportunities (latest feed)
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .limit(100);

  // Fetch user interactions and recommendations if logged in
  let savedIds: string[] = [];
  let recommendations: Opportunity[] = [];

  if (user) {
    // 1. Fetch saved IDs
    const { data: saves } = await supabase
      .from("opportunity_interactions")
      .select("opportunity_id")
      .eq("user_id", user.id)
      .eq("interaction_type", "save");

    if (saves) {
      savedIds = saves.map((s) => s.opportunity_id);
    }

    // 2. Fetch Personalized Recommendations
    const { data: recs } = await supabase.rpc("get_recommended_opportunities", {
      p_user_id: user.id,
      p_limit: 8,
    });

    if (recs) {
      recommendations = recs as Opportunity[];
    }
  }
  if (true) {
    return <ComingSoon />;
  }
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-8 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">
            Opportunities
          </h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg">
            Curated internships, hackathons, and scholarships aligned with your
            stack.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/opportunities/submit">
            <Plus className="w-4 h-4" />
            Submit
          </Link>
        </Button>
      </div>

      <OpportunitiesFeedClient
        initialOpportunities={(opportunities as Opportunity[]) || []}
        initialSavedIds={savedIds}
        recommendations={recommendations}
      />
    </div>
  );
}
