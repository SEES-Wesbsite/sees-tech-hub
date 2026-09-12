import Link from 'next/link';
import { signOut } from '@/app/actions/profile';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-4xl flex-wrap items-center gap-6 px-6 py-5">
        <Link href="/" className="mr-auto font-semibold">SEES Tech Hub</Link>
        <Link href="/dashboard">Overview</Link>
        <Link href="/profile">Edit profile</Link>
        <form action={signOut}><button className="text-muted-foreground">Sign out</button></form>
      </nav>
    </header>
    <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
  </div>;
}
