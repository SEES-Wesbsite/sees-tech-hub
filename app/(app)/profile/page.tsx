import { requireCompletedProfile } from '@/lib/profile';
import { ProfileForm } from '@/components/profile-form';

export default async function EditProfilePage() {
  const profile = await requireCompletedProfile();
  return <section className="mx-auto max-w-xl">
    <h1 className="mb-8 text-3xl font-semibold tracking-tight">Your profile</h1>
    <ProfileForm profile={profile} />
  </section>;
}
