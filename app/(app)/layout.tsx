import Link from 'next/link';
import { signOut } from '@/app/actions/profile';
import { getExecutiveAccess } from '@/lib/executive-access';
import { Logo } from '@/components/ui/logo';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getExecutiveAccess();
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-6 py-5"><Link href="/" className="mr-auto" aria-label="SEES Tech Hub homepage"><Logo variant="horizontal" textClassName="text-base font-semibold" /></Link><Link href="/dashboard" className="text-sm hover:underline">Member home</Link><Link href="/profile" className="text-sm hover:underline">Edit profile</Link>{role && <Link href="/admin" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-brand-light">Executive Hub</Link>}<form action={signOut}><button className="text-sm text-muted-foreground">Sign out</button></form></nav></header>
    <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
  </div>;
}
