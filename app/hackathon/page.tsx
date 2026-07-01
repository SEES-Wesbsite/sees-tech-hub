import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TracksSection } from "@/components/hackathon/tracks-section";
import { ProjectBacklog } from "@/components/hackathon/project-backlog";
import { Trophy, Target, AlertTriangle } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

export const metadata: Metadata = {
  title: "Hackathon",
  description:
    "Join the SEES Hackathon. Build campus solutions for UNILAG students.",
  openGraph: {
    title: "Hackathon | SEES Tech Hub",
    description:
      "Join the SEES Hackathon. Build campus solutions for UNILAG students.",
    images: [
      "/api/og/default?title=SEES%20Hackathon%202026&description=Build%20campus%20solutions%20for%20UNILAG%20students.",
    ],
  },
  twitter: {
    images: [
      "/api/og/default?title=SEES%20Hackathon&description=Build%20campus%20solutions%20for%20UNILAG%20students.",
    ],
  },
};

export default function HackathonLandingPage() {
  return (
    <div className="bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-slate-50 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-light/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

        <FadeIn
          delay={0.1}
          className="container mx-auto max-w-5xl relative z-10 text-center"
        >
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-sm font-medium mb-6 uppercase tracking-wide">
            <Trophy className="w-4 h-4" />
            <span>STH Mini Hackathon 2026</span>
          </div> */}

          <h1 className="text-4xl md:text-7xl font-serif font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Build the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
              UNILAG Campus
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Four tracks. One goal. Solve everyday problems for UNILAG students
            and win a share of the prize pool.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-brand/20 text-white hover:bg-brand-light bg-brand"
            >
              <Link href="/hackathon/submit">Submit Concept Note</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-transparent border-border hover:bg-secondary text-foreground"
            >
              <a href="#criteria">View Judging Criteria</a>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Theme Section */}
      <section className="py-20 border-y border-slate-200 bg-slate-50">
        <FadeIn
          delay={0.2}
          className="container px-4 mx-auto max-w-4xl text-center"
        >
          <h2 className="text-sm font-bold text-brand uppercase tracking-widest mb-4">
            The Theme
          </h2>
          <p className="text-2xl md:text-4xl font-medium text-slate-800 leading-snug">
            "Campus Solutions — Solving everyday problems for UNILAG students."
          </p>
        </FadeIn>
      </section>

      {/* Tracks */}
      <TracksSection />

      {/* Judging Criteria */}
      <section id="criteria" className="py-24 bg-white">
        <FadeIn className="container px-4 mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-brand/10 rounded-xl text-brand">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Judging Criteria
            </h2>
          </div>
          <p className="text-slate-600 mb-10 text-lg">
            Projects will be evaluated by our panel of expert judges based on
            the following key metrics:
          </p>

          <ul className="space-y-6">
            {[
              {
                title: "Impact & Relevance",
                desc: "Does this solve a real problem for UNILAG students? The proposed solution should have a clear target audience and a measurable positive effect on campus life.",
              },
              {
                title: "Technical Complexity",
                desc: "Is the architecture robust? Are the chosen tools used effectively? We are looking for projects that push the technical boundaries of what can be built during a hackathon.",
              },
              {
                title: "Execution & Polish",
                desc: "Does it work? Is the UI/UX intuitive and free of major bugs? A clean, finished MVP often beats a complex but broken prototype.",
              },
              {
                title: "Presentation & Pitch",
                desc: "How well is the idea communicated? Your demo and README should clearly explain the problem, the solution, and how to use the software.",
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex flex-col border-b border-slate-100 pb-6 last:border-0 last:pb-0"
              >
                <h4 className="font-bold text-slate-900 text-xl mb-2 flex items-center gap-2">
                  <span className="text-brand">•</span> {item.title}
                </h4>
                <p className="text-base text-slate-600 leading-relaxed ml-4">
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* Project Backlog */}
      <ProjectBacklog />

      {/* Final CTA */}
      <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden rounded-t-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent pointer-events-none" />
        <FadeIn
          direction="up"
          className="container px-4 mx-auto max-w-3xl relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready to Build?
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Submit your Concept Note today. We are looking for bold ideas and
            passionate builders.
          </p>
          <Button
            asChild
            size="lg"
            variant="default"
            className="h-14 px-10 text-lg rounded-full bg-brand text-white hover:bg-brand-light shadow-2xl shadow-brand/20 border-0"
          >
            <Link href="/hackathon/submit">Submit Concept Note</Link>
          </Button>
        </FadeIn>
      </section>
    </div>
  );
}
