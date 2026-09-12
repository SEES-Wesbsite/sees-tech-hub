import Link from 'next/link';
import { requireCompletedProfile } from '@/lib/profile';
import { ProfileCard } from '@/components/profile-card';

export default async function DashboardPage() {
  const profile = await requireCompletedProfile();
  return <div className="space-y-6">
    <ProfileCard profile={profile} />
    <Link href="/profile" className="inline-block text-brand underline underline-offset-4">Edit your profile</Link>
  </div>;
}
