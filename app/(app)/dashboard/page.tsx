import type { Metadata } from 'next';
import { requireCompletedProfile } from '@/lib/profile';
import { MemberHome } from '@/components/member-home/member-home';

export const metadata: Metadata = {
  title: 'Member home',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const profile = await requireCompletedProfile();
  return <MemberHome profile={profile} initialNow={new Date().getTime()} />;
}
