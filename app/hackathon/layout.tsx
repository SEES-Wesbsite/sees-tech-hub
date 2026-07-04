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
        <div className="container mx-auto px-4 h-16 flex items-center justify-center max-w-6xl">
          <Link
            href="/hackathon"
            className="flex items-center justify-between w-full hover:opacity-90 transition-opacity"
          >
            <div className="bg-brand w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <img
                src="/sees-logo.png"
                alt="SEES"
                className="w-8 h-8 object-contain"
              />
            </div>

            <div className="flex items-center gap-2 font-serif font-bold text-lg tracking-tight text-slate-900">
              <span>SEES</span>
              <span className="text-slate-400 font-medium text-sm">X</span>
              <span>STH</span>
            </div>

            <Logo className="w-10 h-10 text-slate-900 shrink-0" />
          </Link>
        </div>
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
