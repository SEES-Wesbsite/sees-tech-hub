import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 md:py-24 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 font-semibold font-serif text-2xl tracking-tighter text-white mb-6">
            <Logo variant="logomark" className="w-8 h-8 text-white" />
            SEES Tech Hub.
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Empowering students to master algorithms, build undeniable products,
            and secure their future in tech.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">
            Platform
          </h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/tasks"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                DSA Sprints
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Alumni Talks
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboard"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Leaderboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">
            Resources
          </h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Hackathon Guide
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Leetcode Vault
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Resume Review
              </Link>
            </li>
          </ul>
        </div>

        {/* Action Column */}
        <div>
          <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">
            Join Us
          </h4>
          <p className="text-slate-400 text-sm mb-4">
            Ready to stop grinding alone?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#95fde2] font-bold hover:text-white transition-colors"
          >
            Create an Account <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-xs">
          © {new Date().getFullYear()} SEES Tech Hub. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="text-slate-500 hover:text-white text-xs transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-slate-500 hover:text-white text-xs transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
