"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { YourQuests } from "./your-quests";
import { AllQuestsClient } from "./all-quests";

interface UserQuestsClientProps {
  weeklyAssignments: any[];
  allCompletedAssignments: any[];
  allQuests: any[];
}

export function UserQuestsClient({ 
  weeklyAssignments, 
  allCompletedAssignments, 
  allQuests 
}: UserQuestsClientProps) {
  
  return (
    <Tabs defaultValue="active" className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <TabsList className="bg-foreground/5 border border-border/50 p-1">
          <TabsTrigger
            value="active"
            className="rounded-xl px-8 py-3 text-sm font-semibold"
          >
            Weekly 3
          </TabsTrigger>
          <TabsTrigger
            value="global"
            className="rounded-xl px-8 py-3 text-sm font-semibold"
          >
            Global Bank
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="active" className="space-y-8">
        <YourQuests 
          assignments={weeklyAssignments} 
          allCompletedAssignments={allCompletedAssignments}
        />
      </TabsContent>

      <TabsContent value="global" className="space-y-8">
        <AllQuestsClient allQuests={allQuests} />
      </TabsContent>
    </Tabs>
  );
}
