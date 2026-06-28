'use client';

import { Quest } from '@/lib/types';
import InfiniteMenu from '@/components/InfiniteMenu';
import { useRouter } from 'next/navigation';

interface QuestBoardProps {
  quests: Quest[];
}

export function QuestBoard({ quests }: QuestBoardProps) {
  const router = useRouter();

  // Map backend Quests to InfiniteMenu format
  const menuItems = quests.map((quest, i) => {
    // Generate a consistent but distinct abstract image for each task type
    let imageUrl = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop';
    
    if (quest.quest_type === 'dsa_problem') {
      imageUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop';
    } else if (quest.quest_type === 'project_build') {
      imageUrl = 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=2088&auto=format&fit=crop';
    } else if (quest.quest_type === 'quiz') {
      imageUrl = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop';
    }

    return {
      image: imageUrl,
      link: `/quests/${quest.id}`,
      title: `${quest.title} [${quest.difficulty}-Rank]`,
      description: `Bounty: ${quest.point_value} XP. ${quest.description.slice(0, 50)}...`
    };
  });

  // If no tasks exist, provide a dummy one so the menu doesn't crash
  if (menuItems.length === 0) {
    menuItems.push({
      image: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=2050&auto=format&fit=crop',
      link: '#',
      title: 'No Active Gates',
      description: 'Check back later for new bounties.'
    });
  }

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-[32px] overflow-hidden p-6">
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Active Gates</h2>
        <span className="text-sm font-bold text-brand-light uppercase tracking-widest bg-brand/10 px-4 py-1.5 rounded-full border border-brand/20">
          {quests.length} Available
        </span>
      </div>

      <div className="w-full h-[400px] relative rounded-2xl overflow-hidden border border-white/5">
        <InfiniteMenu items={menuItems} />
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Drag to explore active bounties</p>
      </div>
    </div>
  );
}
