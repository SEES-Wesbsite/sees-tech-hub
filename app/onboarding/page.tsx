import { redirect } from 'next/navigation';
import { getOwnProfile } from '@/lib/profile';
import { ProfileForm } from '@/components/profile-form';
import { signOut } from '@/app/actions/profile';

export default async function OnboardingPage() {
  const profile = await getOwnProfile();
  if (profile.onboarding_status === 'completed') redirect('/dashboard');
  return <main className="min-h-screen bg-background px-6 py-16 text-foreground">
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Welcome to SEES Tech Hub</h1>
      <p className="mb-8 mt-3 text-muted-foreground">Add a few details to complete your profile.</p>
      <ProfileForm profile={profile} />
      <form action={signOut} className="mt-8"><button className="text-sm text-muted-foreground">Sign out</button></form>
    </section>
  </main>;
}
