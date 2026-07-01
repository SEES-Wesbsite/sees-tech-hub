import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RecommendedOpportunitiesProps {
  opportunities: any[];
}

export function RecommendedOpportunities({
  opportunities,
}: RecommendedOpportunitiesProps) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <Card className="bg-foreground/5 border-border/50 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand tracking-wide" />
          Recommended for You
        </CardTitle>
        <Link
          href="/opportunities"
          className="text-sm text-brand hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/10">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/opportunities/${opp.id}`}
              className="block p-4 hover:bg-foreground/5 transition-colors group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                    {opp.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {opp.organization} • {opp.location_type}{" "}
                    {opp.location ? `• ${opp.location}` : ""}
                  </p>
                </div>
                {opp.compensation && (
                  <div className="hidden sm:block text-right">
                    <span className="inline-block px-2 py-1 bg-success/10 text-success text-xs rounded-md font-mono">
                      {opp.compensation}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">
                  {opp.opportunity_type}
                </span>
                <span className="text-xs text-muted-foreground">
                  Posted{" "}
                  {formatDistanceToNow(new Date(opp.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
