import Link from 'next/link';
import type { LinkState } from '@/lib/short-links';

export const fieldClass = 'min-w-0 w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring';
export const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryButtonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50';
export function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-6"><div className="min-w-0 max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p><h1 className="break-words font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1><p className="mt-4 leading-relaxed text-muted-foreground">{description}</p></div>{children}</header>;
}
export function StatusBadge({ state }: { state: LinkState }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${state === 'active' ? 'bg-brand/10 text-brand' : 'bg-secondary text-secondary-foreground'}`}>{state}</span>;
}
export function BackToLinks() { return <Link href="/admin/links" className="text-sm text-brand underline underline-offset-4">All short links</Link>; }

