import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero";
import { AlumniPipeline } from "@/components/landing/alumni-pipeline";
import { HackerArena } from "@/components/landing/hacker-arena";
import { Hackathons } from "@/components/landing/hackathons";
import { TeamRoster } from "@/components/landing/team-roster";
import { Footer } from "@/components/landing/footer";
import { Loader } from "@/components/ui/loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEES Tech Hub - The Portal for SEES Builders",
  description:
    "Join the exclusive portal for SEES builders. Connect with top talent, discover exclusive opportunities, and participate in hackathons at UNILAG.",
  openGraph: {
    images: [
      "/api/og/default?title=The%20Portal%20for%20SEES%20Builders&description=Connect%20with%20top%20talent%20and%20discover%20exclusive%20opportunities.",
    ],
  },
  twitter: {
    images: [
      "/api/og/default?title=The%20Portal%20for%20SEES%20Builders&description=Connect%20with%20top%20talent%20and%20discover%20exclusive%20opportunities.",
    ],
  },
};
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <AlumniPipeline />
        <HackerArena />
        <Hackathons />
        <TeamRoster />
      </main>

      <Footer />
    </div>
  );
}
