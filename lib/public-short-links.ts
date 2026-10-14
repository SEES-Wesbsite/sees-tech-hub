import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';
import { safeDestination, type LinkResolution } from '@/lib/short-links';

// Public resolution does not read session cookies or use a service-role credential.
export async function resolvePublicLink(slug: string, kind: 'visit' | 'continue' | 'inspect'): Promise<LinkResolution> {
  if (!slug || slug.length > 50) return { state: 'missing' };
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc('resolve_short_link', { link_slug: slug, request_kind: kind });
  if (error || !data) throw new Error('Link service is temporarily unavailable.');
  if (data.destination_url && !safeDestination(data.destination_url)) return { state: 'unavailable' };
  return data;
}
