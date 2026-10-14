import { z } from 'zod';

export const linkStates = ['active', 'scheduled', 'expired', 'paused', 'archived'] as const;
export type LinkState = typeof linkStates[number];
export type ShortLink = {
  id: string; slug: string; destination_url: string; description: string | null;
  clicks: number; created_by: string | null; is_active: boolean; created_at: string;
  starts_at: string | null; expires_at: string | null; archived_at: string | null;
  intro_enabled: boolean; intro_title: string | null; intro_message: string | null;
  intro_button: string; updated_at: string;
};
export type DailyTraffic = { id: string; link_id: string; day: string; visits: number; clicks: number };
export type ExecutiveRole = 'admin' | 'super_admin';
export type ExecutiveAccount = { user_id: string; email: string; full_name: string; access_role: ExecutiveRole | null };
export type AuditEntry = { id: string; actor_id: string | null; actor_name: string; category: 'access' | 'link'; target_id: string; action: string; details: Record<string, unknown>; created_at: string };
export type LinkResolution = { state: LinkState | 'missing' | 'unavailable' | 'intro' | 'redirect'; destination_url?: string; title?: string; message?: string; button?: string; starts_at?: string };
export type ActionResult = { error?: string; success?: string };

export function safeDestination(value: string): string | null {
  if (value.length > 4096 || /[\s\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && Boolean(url.hostname) ? url.href : null;
  } catch { return null; }
}

export function linkState(link: Pick<ShortLink, 'archived_at' | 'is_active' | 'starts_at' | 'expires_at'>, now = Date.now()): LinkState {
  if (link.archived_at) return 'archived';
  if (!link.is_active) return 'paused';
  if (link.expires_at && now >= Date.parse(link.expires_at)) return 'expired';
  if (link.starts_at && now < Date.parse(link.starts_at)) return 'scheduled';
  return 'active';
}

// A datetime-local input has no timezone. Interpret it explicitly as Lagos (UTC+1).
export function lagosToUtc(value: string): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Use a valid date and time.');
  const date = new Date(`${value}:00+01:00`);
  if (!Number.isFinite(date.getTime()) || utcToLagos(date.toISOString()) !== value) throw new Error('Use a valid date and time.');
  return date.toISOString();
}
export function utcToLagos(value: string | null): string {
  return value ? new Date(Date.parse(value) + 3600000).toISOString().slice(0, 16) : '';
}
export function formatLagos(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) + ' WAT';
}

export const shortLinkSchema = z.object({
  slug: z.string().trim().max(50).regex(/^$|^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens for the slug.'),
  destination_url: z.string().trim().refine((s) => safeDestination(s) !== null, 'Use a complete HTTP or HTTPS URL without spaces or embedded credentials.'),
  description: z.string().trim().max(1000),
  starts_at: z.string().nullable(), expires_at: z.string().nullable(),
  intro_enabled: z.boolean(), intro_title: z.string().trim().max(160),
  intro_message: z.string().trim().max(2000), intro_button: z.string().trim().min(1).max(60),
}).superRefine((data, ctx) => {
  for (const key of ['starts_at', 'expires_at'] as const) {
    if (data[key] && !Number.isFinite(Date.parse(data[key]))) ctx.addIssue({ code: 'custom', message: 'Invalid schedule.', path: [key] });
  }
  if (data.starts_at && data.expires_at && Date.parse(data.expires_at) <= Date.parse(data.starts_at)) ctx.addIssue({ code: 'custom', message: 'Expiry must be after activation.', path: ['expires_at'] });
  if (data.intro_enabled && (!data.intro_title || !data.intro_message)) ctx.addIssue({ code: 'custom', message: 'Add a title and message for the introduction.', path: ['intro_title'] });
});
export type LinkSettings = Omit<z.infer<typeof shortLinkSchema>, 'slug'>;
export function parseLinkForm(form: FormData) {
  const get = (key: string) => String(form.get(key) ?? '');
  return shortLinkSchema.parse({
    slug: get('slug'), destination_url: get('destination_url'), description: get('description'),
    starts_at: lagosToUtc(get('starts_at')), expires_at: lagosToUtc(get('expires_at')),
    intro_enabled: form.get('intro_enabled') === 'on', intro_title: get('intro_title'),
    intro_message: get('intro_message'), intro_button: get('intro_button') || 'Continue',
  });
}
