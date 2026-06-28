"use client";

import { useMemo, useState, useEffect } from "react";
import { TIER_THRESHOLDS } from "@/lib/constants";
import Lanyard from "@/components/Lanyard";

interface RankWidgetProps {
  score: number;
}

export function RankWidget({ score }: RankWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { currentRank, colorHex, emblem } = useMemo(() => {
    if (score >= TIER_THRESHOLDS.S)
      return { currentRank: "S", colorHex: "#FFD700", emblem: "👑" };
    if (score >= TIER_THRESHOLDS.A)
      return { currentRank: "A", colorHex: "#EF4444", emblem: "⬢" };
    if (score >= TIER_THRESHOLDS.B)
      return { currentRank: "B", colorHex: "#A855F7", emblem: "✧" };
    if (score >= TIER_THRESHOLDS.C)
      return { currentRank: "C", colorHex: "#3B82F6", emblem: "✦" };
    if (score >= TIER_THRESHOLDS.D)
      return { currentRank: "D", colorHex: "#10B981", emblem: "◆" };
    return { currentRank: "E", colorHex: "#A1A1AA", emblem: "◇" };
  }, [score]);

  // Generate SVG Data URI for the Lanyard Card
  const svgDataUri = useMemo(() => {
    const width = 600;
    const height = 900;

    // We create a stylized tech-ID SVG
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="100%" height="100%" fill="#0a0a0c" />
        
        <!-- Glowing Inner Border -->
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="${colorHex}" stroke-width="12" rx="40" opacity="0.8" />
        <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="${colorHex}" stroke-width="2" rx="20" opacity="0.3" />
        
        <!-- Header text -->
        <text x="300" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#ffffff" opacity="0.4" text-anchor="middle" letter-spacing="8">SEES TECH HUB</text>
        <path d="M 150 150 L 450 150" stroke="${colorHex}" stroke-width="2" opacity="0.3" />

        <!-- Emblem and Rank on the same line -->
        <text x="300" y="450" font-family="var(--font-serif), Georgia, serif" font-size="100" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          <tspan fill="${colorHex}">${emblem}</tspan> ${currentRank} Rank
        </text>

        <!-- Points Display (Bigger underneath) -->
        <text x="300" y="580" font-family="monospace" font-size="72" font-weight="bold" fill="${colorHex}" text-anchor="middle" letter-spacing="2">${score.toLocaleString()}</text>
      </svg>
    `;

    // Encode SVG to base64 safely
    const base64 =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : "";
    return `data:image/svg+xml;base64,${base64}`;
  }, [currentRank, colorHex, emblem, score]);

  if (!isMounted)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/50">
        Loading Identity...
      </div>
    );

  return (
    <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
      {/* We pass the SVG data URI to the frontImage of the Lanyard */}
      {/* <Lanyard
        position={[0, 0, 30]}
        gravity={[0, -40, 0]}
        transparent={true}
        frontImage={svgDataUri}
        backImage={svgDataUri}
        imageFit="cover"
      /> */}

      {/* Background radial glow based on rank color to ground the 3D model */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] rounded-full blur-[120px] opacity-10 pointer-events-none -z-10"
        style={{ backgroundColor: colorHex }}
      />
    </div>
  );
}
