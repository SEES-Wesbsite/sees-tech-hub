"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, CalendarCheck, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AdminSignupsChart } from "@/components/admin/admin-charts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface AdminDashboardClientProps {
  kpis: {
    totalUsers: number;
    pendingOpportunities: number;
    totalRSVPs: number;
  };
  needsAttention: any[];
  recentUsers: any[];
  chartData: any[];
}

export function AdminDashboardClient({
  kpis,
  needsAttention,
  recentUsers,
  chartData
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-brand/10 border-brand/20">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-brand">Total Users</p>
              <Users className="w-5 h-5 text-brand" />
            </div>
            <h4 className="text-4xl font-bold font-mono text-brand">{kpis.totalUsers}</h4>
          </CardContent>
        </Card>

        <Card className={kpis.pendingOpportunities > 0 ? "bg-warning/10 border-warning/20" : "bg-card"}>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <p className={`text-sm font-medium ${kpis.pendingOpportunities > 0 ? "text-warning" : "text-muted-foreground"}`}>
                Pending Opportunities
              </p>
              <Briefcase className={`w-5 h-5 ${kpis.pendingOpportunities > 0 ? "text-warning" : "text-muted-foreground"}`} />
            </div>
            <div className="flex justify-between items-end">
              <h4 className={`text-4xl font-bold font-mono ${kpis.pendingOpportunities > 0 ? "text-warning" : ""}`}>{kpis.pendingOpportunities}</h4>
              {kpis.pendingOpportunities > 0 && (
                <Link href="/admin/opportunities">
                  <Button variant="outline" size="sm" className="h-8 border-warning/50 text-warning hover:bg-warning hover:text-warning-foreground">
                    Review
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-muted-foreground">Total RSVPs</p>
              <CalendarCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="text-4xl font-bold font-mono">{kpis.totalRSVPs}</h4>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Charts & Attention List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Signups (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminSignupsChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-5 h-5" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {needsAttention.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  All caught up! No pending items.
                </div>
              ) : (
                <div className="divide-y">
                  {needsAttention.map(opp => (
                    <div key={opp.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <p className="font-medium line-clamp-1">{opp.title}</p>
                      <p className="text-sm text-muted-foreground">{opp.organization}</p>
                      <div className="mt-2 text-right">
                        <Link href="/admin/opportunities" className="text-xs text-brand hover:underline">
                          Review →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{(user.preferred_name || user.full_name || "?").substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.preferred_name || user.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
