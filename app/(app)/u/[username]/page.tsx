import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Profile, Submission, Quest } from "@/lib/types";
import {
  Link as LinkIcon,
  Globe,
  Trophy,
  CheckCircle2,
  Code2,
} from "lucide-react";

const RANK_META: Record<string, { color: string }> = {
  S: { color: "text-destructive bg-destructive/10 border-destructive/20" },
  A: { color: "text-warning bg-warning/10 border-warning/20" },
  B: { color: "text-brand bg-brand/10 border-brand/20" },
  C: { color: "text-success bg-success/10 border-success/20" },
  D: { color: "text-info bg-info/10 border-info/20" },
  E: { color: "text-muted-foreground bg-muted border-border" },
};

function getRankFromPoints(points: number): string {
  if (points >= 5000) return "S";
  if (points >= 2500) return "A";
  if (points >= 1000) return "B";
  if (points >= 500) return "C";
  if (points >= 100) return "D";
  return "E";
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();

  // Reconstruct the name from the slug (e.g. 'john-doe' -> 'john doe')
  const nameQuery = (await params).username.replace(/-/g, " ");

  // Try finding by preferred name first
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("preferred_name", nameQuery)
    .maybeSingle();

  // Fallback to full name if no preferred name matched
  if (!user) {
    const { data: fallbackUser } = await supabase
      .from("users")
      .select("*")
      .ilike("full_name", nameQuery)
      .maybeSingle();

    user = fallbackUser;
  }

  if (!user) {
    notFound();
  }

  const profile = user as Profile;

  // Fetch approved submissions (Trophy Room)
  const { data: rawSubmissions } = await supabase
    .from("submissions")
    .select("*, quest_bank(*)")
    .eq("user_id", profile.id)
    .eq("status", "approved")
    .order("submitted_at", { ascending: false });

  const trophies = (rawSubmissions || []).map((sub: any) => ({
    ...sub,
    quest_bank: sub.quest_bank as Quest,
  }));

  const displayName = profile.preferred_name || profile.full_name;

  const rankKey = getRankFromPoints(profile.total_points || 0);
  const rankStyle = RANK_META[rankKey] || RANK_META["E"];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header Background */}
      <div className="h-64 md:h-80 w-full bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-brand/5" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10">
        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-3xl bg-background border-4 border-card flex items-center justify-center font-serif font-semibold text-5xl text-muted-foreground shadow-lg overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-foreground flex items-center gap-3">
                  {displayName}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-serif font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${rankStyle.color}`}
                >
                  <Trophy className="w-4 h-4" /> Rank {rankKey}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {profile.portfolio_link && (
                  <a
                    href={profile.portfolio_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-brand transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" /> Portfolio
                  </a>
                )}
                {profile.social_link && (
                  <a
                    href={profile.social_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-brand transition-colors"
                  >
                    <Globe className="w-4 h-4" /> Social Profile
                  </a>
                )}
              </div>
            </div>

            {/* Points Box */}
            <div className="w-full md:w-48 bg-secondary/50 border border-border rounded-2xl p-6 text-center shrink-0">
              <p className="text-sm font-serif font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Total Points
              </p>
              <p className="text-4xl md:text-5xl font-serif font-semibold text-foreground">
                {profile.total_points || 0}
              </p>
            </div>
          </div>

          <hr className="my-10 border-border" />

          {/* Focus Areas (Primary Stacks) */}
          <div className="mb-10">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand" /> Focus Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.primary_stacks && profile.primary_stacks.length > 0 ? (
                profile.primary_stacks.map((stack) => (
                  <span
                    key={stack}
                    className="px-4 py-2 rounded-xl bg-brand/10 border border-brand/20 text-sm font-semibold text-brand shadow-[0_0_15px_rgba(2,92,72,0.1)]"
                  >
                    {stack}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No focus areas set yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trophy Room (Bounties Completed) */}
        <div className="mt-12">
          <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-brand" />
            Trophy Room
          </h2>

          {trophies.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-3xl shadow-sm">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                No bounties claimed yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trophies.map((sub) => {
                const quest = sub.quest_bank;
                return (
                  <div
                    key={sub.id}
                    className="bg-card p-6 rounded-2xl border border-border hover:border-brand/30 transition-colors shadow-sm flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground text-lg">
                        {quest?.title || "Unknown Quest"}
                      </h3>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xl font-serif font-semibold text-brand leading-none">
                          {quest?.point_value || 0}
                        </span>
                        <span className="text-[10px] font-semibold text-brand uppercase tracking-widest mt-1">
                          PTS
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {quest?.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-md border border-success/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(sub.submitted_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
