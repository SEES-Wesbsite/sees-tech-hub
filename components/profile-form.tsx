'use client';

import { useActionState } from 'react';
import { saveProfile } from '@/app/actions/profile';
import type { Profile } from '@/lib/types';

export function ProfileForm({ profile }: { profile: Pick<Profile, 'full_name' | 'preferred_name' | 'primary_stacks' | 'github_url' | 'portfolio_link' | 'social_link'> }) {
  const [state, action, pending] = useActionState(saveProfile, { error: null });
  const fields = [
    { name: 'full_name', label: 'Full name', value: profile.full_name, required: true, maxLength: 255 },
    { name: 'preferred_name', label: 'Preferred name', value: profile.preferred_name ?? profile.full_name.split(' ')[0], required: true, maxLength: 255 },
    { name: 'primary_stacks', label: 'Interests and skills (separate with commas)', value: (profile.primary_stacks ?? []).join(', '), required: false, maxLength: 3030 },
    { name: 'github_url', label: 'GitHub URL', value: profile.github_url, required: false, maxLength: 1024 },
    { name: 'portfolio_link', label: 'Portfolio URL', value: profile.portfolio_link, required: false, maxLength: 1024 },
    { name: 'social_link', label: 'Social URL', value: profile.social_link, required: false, maxLength: 1024 },
  ];

  return <form action={action} className="space-y-6">
    {fields.map((field) => <div key={field.name} className="space-y-2">
      <label htmlFor={field.name} className="block text-sm font-medium">{field.label}</label>
      <input id={field.name} name={field.name} defaultValue={field.value ?? ''}
        required={field.required} maxLength={field.maxLength}
        autoComplete={field.name === 'full_name' ? 'name' : 'off'}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring" />
    </div>)}
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button disabled={pending} className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50">
      {pending ? 'Saving…' : 'Save profile'}
    </button>
  </form>;
}
