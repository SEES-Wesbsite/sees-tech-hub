'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
    <h1 className="text-3xl font-semibold">Something went wrong</h1>
    <p className="text-muted-foreground">Please try again. If this continues, contact the SEES team.</p>
    <button onClick={reset} className="rounded-lg bg-primary px-5 py-3 text-primary-foreground">Try again</button>
    <Link href="/" className="text-brand underline">Return home</Link>
  </main>;
}
