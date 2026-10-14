import type { Profile } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Code2, Globe, Link as LinkIcon } from 'lucide-react';
import { safeProfileUrl } from '@/lib/profile-validation';

type ProfileCardProps = {
  profile: Pick<Profile, 'full_name' | 'preferred_name' | 'avatar_url' | 'primary_stacks' | 'github_url' | 'portfolio_link' | 'social_link'>;
  headingLevel?: 'h1' | 'h2';
  editable?: boolean;
  memberSince?: string;
};

export function ProfileCard({ profile, headingLevel: Heading = 'h1', editable = false, memberSince }: ProfileCardProps) {
  const avatar = safeProfileUrl(profile.avatar_url);
  const initials = profile.full_name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const stacks = profile.primary_stacks ?? [];
  const links = [
    { label: 'GitHub', value: profile.github_url, Icon: Code2 },
    { label: 'Portfolio', value: profile.portfolio_link, Icon: Globe },
    { label: 'Social profile', value: profile.social_link, Icon: LinkIcon },
  ].flatMap((link) => {
    const href = safeProfileUrl(link.value);
    return href ? [{ ...link, href }] : [];
  });
  const joined = memberSince && Number.isFinite(Date.parse(memberSince))
    ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }).format(new Date(memberSince))
    : null;

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{editable ? 'Your member profile' : 'Member profile'}</p>

      </div>
      {avatar
        ? <Image src={avatar} alt="" width={64} height={64} unoptimized referrerPolicy="no-referrer" className="mb-4 size-16 rounded-2xl object-cover" />
        : <div aria-hidden="true" className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand/10 font-serif text-2xl text-brand">{initials || 'STH'}</div>}
      <Heading className="break-words text-2xl font-semibold tracking-tight">{profile.preferred_name || profile.full_name}</Heading>
      {profile.preferred_name && profile.preferred_name !== profile.full_name && <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">{profile.full_name}</p>}
      {joined && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Member since <time dateTime={memberSince}>{joined}</time></p>}

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Interests & skills</h3>
        {stacks.length ? <><ul className="mt-3 flex flex-wrap gap-2" aria-label="Interests and skills">{stacks.slice(0, 6).map((stack, index) => <li key={index} className="max-w-full break-words rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">{stack}</li>)}</ul>{stacks.length > 6 && <details className="mt-3 text-sm"><summary className="cursor-pointer py-2 text-brand">{stacks.length - 6} more interests & skills</summary><ul className="mt-2 flex flex-wrap gap-2">{stacks.slice(6).map((stack, index) => <li key={index} className="max-w-full break-words rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium">{stack}</li>)}</ul></details>}</>
          : <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{editable ? 'Add the skills and interests you’d like to share with the hub.' : 'No interests or skills shared yet.'}</p>}
      </div>
      {links.length > 0 && <nav aria-label="Profile links" className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3">{links.map(({ label, href, Icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><Icon size={15} aria-hidden="true" />{label}<span className="sr-only"> (opens in a new tab)</span></a>)}</nav>}
      {editable && <Link href="/profile" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-brand/40 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Edit your profile</Link>}
    </section>
  );
}
