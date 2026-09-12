import { z } from 'zod';

export function safeProfileUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href : null;
  } catch {
    return null;
  }
}

const profileLink = z.string().trim().max(1024).refine(
  (value) => value === '' || safeProfileUrl(value) !== null,
  'Use a complete http:// or https:// address without embedded credentials.',
);

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, 'Your full name is required.').max(255),
  preferred_name: z.string().trim().min(1, 'Your preferred name is required.').max(255),
  primary_stacks: z.array(z.string().trim().min(1).max(100)).max(30)
    .transform((values) => [...new Set(values)]),
  github_url: profileLink,
  portfolio_link: profileLink,
  social_link: profileLink,
}).strict();

export type ProfileFormState = { error: string | null };
