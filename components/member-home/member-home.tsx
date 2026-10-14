import Link from 'next/link';
import { ArrowRight, GraduationCap, MessageCircle } from 'lucide-react';
import { ProfileCard } from '@/components/profile-card';
import { Reveal } from '@/app/volunteer/reveal';
import { scholarshipLinks } from '@/app/datacamp/links';
import type { Profile } from '@/lib/types';
import { VolunteerFeature } from './volunteer-feature';

export type MemberHomeProfile = Pick<Profile,
  'full_name' | 'preferred_name' | 'avatar_url' | 'primary_stacks' |
  'github_url' | 'portfolio_link' | 'social_link' | 'created_at'
>;

function SocialIcon({ network }: { network: 'linkedin' | 'instagram' | 'x' }) {
  if (network === 'instagram') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={network === 'linkedin'
    ? 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.54V8.98H7.1v11.47Z'
    : 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z'} /></svg>;
}

export function MemberHome({ profile, initialNow }: { profile: MemberHomeProfile; initialNow: number }) {
  const name = profile.preferred_name || profile.full_name.split(' ')[0];

  return (
    <div className="space-y-10 sm:space-y-12">
      <noscript><style>{'.volunteer-reveal { opacity: 1 !important; transform: none !important; }'}</style></noscript>
      <Reveal>
        <header className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">Your space at SEES Tech Hub</p>
          <h1 className="break-words font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Welcome back, <em className="text-brand">{name}.</em>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Stay close to what we’re building, sharing and doing together.</p>
        </header>
      </Reveal>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <Reveal>
            <section aria-label="At the hub">
              <div className="mb-4 flex items-center gap-3"><span aria-hidden="true" className="h-px w-7 bg-brand" /><h2 className="text-sm font-semibold">At the hub</h2></div>
              <VolunteerFeature initialNow={initialNow} />
            </section>
          </Reveal>

          <Reveal>
            <section aria-labelledby="explore-heading">
              <h2 id="explore-heading" className="mb-4 text-sm font-semibold">Explore an initiative</h2>
              <Link href="/datacamp" className="group block rounded-3xl border border-border bg-card p-6 transition-colors hover:border-brand/40 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-8">
                <div className="flex items-center gap-3 text-brand"><GraduationCap size={23} strokeWidth={1.5} aria-hidden="true" /><span className="text-xs font-semibold uppercase tracking-widest">In partnership with DataCamp</span></div>
                <h3 className="mt-6 font-serif text-3xl tracking-tight">A year to get into <em>something new.</em></h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">500 scholarships. One year of DataCamp access. Explore the programme, what’s included and how to apply.</p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-brand">Explore the scholarships<ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" /></span>
              </Link>
            </section>
          </Reveal>
        </div>

        <aside aria-label="Your profile and community" className="min-w-0 space-y-6 lg:pt-9">
          <Reveal>
            <ProfileCard profile={profile} headingLevel="h2" editable memberSince={profile.created_at} />
          </Reveal>
          <Reveal>
            <section aria-labelledby="community-heading" className="rounded-3xl border border-border p-6">
              <MessageCircle size={24} strokeWidth={1.5} aria-hidden="true" className="mb-5 text-brand" />
              <h2 id="community-heading" className="font-serif text-2xl">Keep the conversation going.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Announcements, conversations and the people behind them. Find us in the community.</p>
              <a href={scholarshipLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Join us on WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
              <nav aria-label="SEES Tech Hub social accounts" className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4">
                {(['linkedin', 'instagram', 'x'] as const).map((network) => <a key={network} href={scholarshipLinks[network]} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><SocialIcon network={network} />{network === 'linkedin' ? 'LinkedIn' : network === 'instagram' ? 'Instagram' : 'X'}<span className="sr-only"> (opens in a new tab)</span></a>)}
              </nav>
            </section>
          </Reveal>
        </aside>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground"><p>A shared space for the SEES Tech Hub community.</p><Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-brand hover:underline">Visit our public site</Link></div>
    </div>
  );
}
