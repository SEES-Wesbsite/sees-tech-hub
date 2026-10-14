import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/ui/logo';
import { resolvePublicLink } from '@/lib/public-short-links';
import { formatLagos, type LinkResolution } from '@/lib/short-links';
import { buttonClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'A link from SEES Tech Hub', robots: { index: false, follow: false } };
const messages: Record<string, { title: string; message: string }> = {
  expired: { title: 'This link has expired.', message: 'The window for this link has closed. Visit the hub for our latest activities.' },
  scheduled: { title: 'A little early.', message: 'This link is scheduled to open soon. Please check back at the time below.' },
  paused: { title: 'Taking a short pause.', message: 'This link is temporarily unavailable. Please check back later.' },
  archived: { title: 'This link has been retired.', message: 'This activity is no longer available through this address.' },
  missing: { title: 'We couldn’t find that link.', message: 'Check the address you were given, or head back to the hub.' },
  unavailable: { title: 'Please try again shortly.', message: 'We can’t open this link right now. Please come back in a moment.' },
};
export default async function LinkPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let result: LinkResolution;
  try { result = await resolvePublicLink(slug, 'inspect'); }
  catch { result = { state: 'unavailable' }; }
  const available = result.state === 'intro' || result.state === 'redirect';
  const content = available ? { title: result.state === 'intro' ? result.title : 'You’re on your way.', message: result.state === 'intro' ? result.message : 'This link takes you directly to the destination below.' } : messages[result.state] ?? messages.unavailable;
  return <main className="flex min-h-screen flex-col bg-background px-6 py-8 text-foreground"><header className="mx-auto w-full max-w-5xl"><Link href="/" aria-label="SEES Tech Hub homepage"><Logo variant="horizontal" textClassName="text-lg font-semibold" /></Link></header><section className="mx-auto my-auto w-full max-w-xl py-20"><p className="mb-5 text-xs font-semibold uppercase tracking-widest text-brand">A connection from SEES Tech Hub</p><h1 className="break-words font-serif text-4xl leading-tight sm:text-5xl">{content.title}</h1><p className="mt-6 whitespace-pre-wrap break-words text-lg leading-relaxed text-muted-foreground">{content.message}</p>{result.state === 'scheduled' && result.starts_at && <p className="mt-5 font-medium text-brand">Opens {formatLagos(result.starts_at)}</p>}{available && result.destination_url ? <><p className="mt-8 break-all rounded-xl bg-secondary p-4 text-sm text-muted-foreground">Destination: {new URL(result.destination_url).hostname}</p><form action={`/go/${encodeURIComponent(slug)}`} method="post" className="mt-6"><button className={buttonClass}>{result.state === 'intro' ? result.button : 'Continue to destination'}</button></form></> : <Link href="/" className={`${buttonClass} mt-8`}>Back to the hub</Link>}</section><footer className="text-center text-xs text-muted-foreground">SEES Tech Hub · University of Lagos</footer></main>;
}
