'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import './globals.css';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <html lang="en"><body>
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="rounded-lg bg-primary px-5 py-3 text-primary-foreground">Try again</button>
    </main>
  </body></html>;
}
