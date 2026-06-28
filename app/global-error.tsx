'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('CRITICAL Root-Level Error Caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
          {/* Subtle noise and glow */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />
          </div>

          <div className="relative z-10 w-full max-w-md border border-red-500/20 bg-black/60 p-8 rounded-3xl shadow-[0_0_80px_rgba(220,38,38,0.15)] text-center">
            
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-zinc-400 text-sm mb-6">
              An unexpected error occurred. Please try again.
            </p>

            <div className="w-full bg-black/80 border border-white/5 rounded-xl p-4 text-left overflow-hidden mb-6">
              <p className="text-xs text-red-400/80 font-mono break-all line-clamp-3">
                {error.message || "Unknown Root Exception"}
              </p>
            </div>

            <button 
              onClick={() => reset()} 
              className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium rounded-xl h-12 flex items-center justify-center"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
