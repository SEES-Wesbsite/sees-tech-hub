import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero";
import { AlumniPipeline } from "@/components/landing/alumni-pipeline";
import { HackerArena } from "@/components/landing/hacker-arena";
import { Hackathons } from "@/components/landing/hackathons";
import { TeamRoster } from "@/components/landing/team-roster";
import { Footer } from "@/components/landing/footer";
import { Loader } from "@/components/ui/loader";

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
