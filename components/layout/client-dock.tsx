"use client";

import { useRouter, usePathname } from "next/navigation";
import Dock from "@/components/Dock";
import {
  Home,
  Trophy,
  Target,
  Shield,
  Settings,
  Moon,
  Sun,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ClientDock({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const items = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Hub",
      onClick: () => router.push("/dashboard"),
      className:
        pathname === "/dashboard" ? "text-brand" : "text-foreground/50",
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: "Quests",
      onClick: () => router.push("/quests"),
      className: pathname.startsWith("/quests")
        ? "text-brand"
        : "text-foreground/50",
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: "Events",
      onClick: () => router.push("/events"),
      className: pathname.startsWith("/events")
        ? "text-brand"
        : "text-foreground/50",
    },
    // {
    //   icon: <Trophy className="w-5 h-5" />,
    //   label: 'Leaderboard',
    //   onClick: () => router.push('/leaderboard'),
    //   className: pathname.startsWith('/leaderboard') ? 'text-brand' : 'text-foreground/50'
    // },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      onClick: () => router.push("/settings"),
      className: pathname.startsWith("/settings")
        ? "text-brand"
        : "text-foreground/50",
    },
    {
      icon:
        theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        ),
      label: "Theme",
      onClick: () => {
        setTheme(theme === "dark" ? "light" : "dark");
      },
      className: "text-foreground/50",
    },
  ];

  if (isAdmin) {
    items.push({
      icon: <Shield className="w-5 h-5" />,
      label: "Admin",
      onClick: () => router.push("/admin"),
      className: pathname.startsWith("/admin")
        ? "text-warning"
        : "text-foreground/50",
    });
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Dock
        items={items}
        panelHeight={64}
        baseItemSize={48}
        magnification={70}
        distance={150}
        className="bg-background/80 backdrop-blur-md border-border"
      />
    </div>
  );
}
