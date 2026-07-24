import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingClient } from './onboarding-client';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile to check their status
  const { data: profile } = await supabase
    .from('users')
    .select('preferred_name, primary_stacks, onboarding_status, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Should never happen if auth is working correctly with our triggers
    return <div>Profile not found</div>;
  }

  // If they somehow hit this page but have already completed onboarding
  if (profile.onboarding_status === 'completed') {
    redirect('/dashboard');
  }

  const defaultName = profile.preferred_name || (profile.full_name && profile.full_name !== 'New User' ? profile.full_name.split(' ')[0] : '');

  return (
    <div className="min-h-screen bg-[#010907] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-light/5 blur-[120px] mix-blend-screen opacity-60" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-dark/20 blur-[150px] mix-blend-screen opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <OnboardingClient 
          initialStep="persona" 
          defaultName={defaultName}
        />
      </div>
    </div>
  );
}
