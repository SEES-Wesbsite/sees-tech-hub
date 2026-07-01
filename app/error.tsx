'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('App-Wide Error Caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Glassmorphism Error Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg border border-white/10 bg-black/40 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive to-transparent opacity-50" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div 
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-destructive/20 border border-destructive/30 flex items-center justify-center text-destructive mb-2 shadow-[0_0_40px_rgba(220,38,38,0.3)]"
          >
            <AlertTriangle className="w-10 h-10" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Oops, an unexpected error occurred. Don't worry, our team has been notified and we are looking into it.
            </p>
          </div>

          <div className="w-full bg-black/50 border border-white/5 rounded-xl p-4 mt-4 text-left overflow-hidden">
            <p className="text-xs text-destructive/80 font-mono break-all line-clamp-3">
              {error.message || "Unknown Runtime Exception"}
            </p>
            {error.digest && (
              <p className="text-xs text-white/40 font-mono mt-2">
                Trace ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
            <Button 
              onClick={() => reset()} 
              variant="outline"
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => {
                reset();
                router.push('/dashboard');
              }}
              variant="default"
              className="flex-1 rounded-xl h-12"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
