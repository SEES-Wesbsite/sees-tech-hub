import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardKPICard({ title, value, icon, description, trend }: DashboardKPICardProps) {
  return (
    <Card className="bg-foreground/5 border-border/50 backdrop-blur-md shadow-sm h-full hover:bg-foreground/10 transition-colors">
      <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-brand/10 text-brand rounded-lg">
            {icon}
          </div>
        </div>
        
        <div>
          <h4 className="text-3xl font-bold font-mono">{value}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
