import type { Profile } from '@/lib/types';
import Image from 'next/image';
import { safeProfileUrl } from '@/lib/profile-validation';

export function ProfileCard({ profile }: { profile: Pick<Profile, 'full_name' | 'preferred_name' | 'avatar_url' | 'primary_stacks' | 'github_url' | 'portfolio_link' | 'social_link'> }) {
  const links = [['GitHub', profile.github_url], ['Portfolio', profile.portfolio_link], ['Social', profile.social_link]];
  const avatar = safeProfileUrl(profile.avatar_url);
  return <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
    {avatar && <Image src={avatar} alt="" width={72} height={72} unoptimized referrerPolicy="no-referrer" className="mb-5 size-18 rounded-full object-cover" />}
    <p className="text-sm text-muted-foreground">Member profile</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight">{profile.preferred_name || profile.full_name}</h1>
    <p className="mt-2 text-muted-foreground">{profile.full_name}</p>
    {(profile.primary_stacks ?? []).length > 0 && <ul aria-label="Interests and skills" className="mt-6 flex flex-wrap gap-2">
      {profile.primary_stacks!.map((stack, index) => <li key={index} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">{stack}</li>)}
    </ul>}
    <div className="mt-6 flex flex-wrap gap-5">
      {links.map(([label, value]) => {
        const href = safeProfileUrl(value);
        return href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4">{label}</a> : null;
      })}
    </div>
  </section>;
}
