import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Profile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface LeaderboardListProps {
  users: Partial<Profile>[];
  currentUserProfile: Profile;
}

export function LeaderboardList({ users, currentUserProfile }: LeaderboardListProps) {
  if (!users || users.length === 0) return null;

  return (
    <Card className="bg-foreground/5 border-border/50 backdrop-blur-md h-full flex flex-col shadow-sm">
      <CardHeader className="pb-3 border-b border-border/10">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          Top Pioneers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-[400px] lg:h-[500px] overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          {users.map((user, index) => {
            const isCurrentUser = user.id === currentUserProfile.id;
            const rank = index + 1;
            
            // Stylize top 3
            let rankColor = "text-muted-foreground";
            if (rank === 1) rankColor = "text-warning font-bold";
            else if (rank === 2) rankColor = "text-slate-300 font-bold";
            else if (rank === 3) rankColor = "text-amber-600 font-bold";

            return (
              <div 
                key={user.id} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isCurrentUser ? "bg-brand/10 border border-brand/20" : "hover:bg-foreground/5"
                }`}
              >
                <div className={`w-6 text-center text-sm ${rankColor}`}>
                  #{rank}
                </div>
                
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-foreground/10 text-xs">
                    {(user.preferred_name || user.full_name || "?").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isCurrentUser ? "font-bold text-brand" : "font-medium text-foreground"}`}>
                    {user.preferred_name || user.full_name}
                    {isCurrentUser && <span className="ml-2 text-[10px] uppercase bg-brand/20 text-brand px-1.5 py-0.5 rounded-full">You</span>}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">{user.total_points?.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
