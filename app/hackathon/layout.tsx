import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-brand selection:text-[#95fde2]">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link
            href="/hackathon"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="font-serif font-bold text-lg hidden sm:inline-block tracking-tight text-slate-900">
              SEES Hackathon
            </span>
            <span className="font-serif font-bold text-lg sm:hidden tracking-tight text-slate-900">
              SEES Hackathon
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full text-white font-semibold"
            >
              <Link href="/hackathon/submit">Submit Concept Note</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
