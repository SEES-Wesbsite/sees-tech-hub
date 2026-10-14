import Link from 'next/link';
import { requireExecutive } from '@/lib/executive-access';
import { Logo } from '@/components/ui/logo';
import { signOut } from '@/app/actions/profile';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Executive Hub | SEES Tech Hub', robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireExecutive();
  return <div className="min-h-screen bg-background text-foreground"><a href="#admin-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a><header className="border-b border-border"><nav aria-label="Executive navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-4 px-6 py-5"><Link href="/dashboard" className="mr-auto" aria-label="SEES Tech Hub home"><Logo variant="horizontal" textClassName="text-base font-semibold" /></Link><Link className="text-sm hover:text-brand hover:underline" href="/admin">Hub</Link><Link className="text-sm hover:text-brand hover:underline" href="/admin/links">Short links</Link>{role === 'super_admin' && <Link className="text-sm hover:text-brand hover:underline" href="/admin/access">Admin access</Link>}<form action={signOut}><button className="text-sm text-muted-foreground hover:text-foreground">Sign out</button></form></nav></header><main id="admin-content" className="mx-auto max-w-6xl space-y-10 px-6 py-10 sm:py-16">{children}</main></div>;
}
