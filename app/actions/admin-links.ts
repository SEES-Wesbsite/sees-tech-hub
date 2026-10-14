'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireExecutive } from '@/lib/executive-access';
import { parseLinkForm, safeDestination, type ActionResult } from '@/lib/short-links';

function invalidate(id?: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/links');
  if (id) revalidatePath(`/admin/links/${id}`);
}
export async function saveShortLink(_state: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireExecutive();
  let input;
  try { input = parseLinkForm(form); }
  catch (error) { return { error: error instanceof z.ZodError ? error.issues[0].message : 'Check the dates and link details.' }; }
  const { slug, ...settings } = input;
  settings.destination_url = safeDestination(settings.destination_url)!;
  const id = String(form.get('id') ?? '');
  if (id) {
    const version = String(form.get('updated_at') ?? '');
    if (!z.uuid().safeParse(id).success || !z.iso.datetime({ offset: true }).safeParse(version).success) return { error: 'Invalid link version. Reload this page.' };
    const { data, error } = await supabase.from('short_links').update(settings).eq('id', id).eq('updated_at', version).select('id').maybeSingle();
    if (error) return { error: 'Could not save the link. Please try again.' };
    if (!data) return { error: 'This link changed while you were editing. Reload the page before saving again.' };
    invalidate(id);
    return { success: 'Link updated.' };
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.from('short_links').insert({ ...settings, slug: slug || randomBytes(5).toString('hex'), created_by: user.id }).select('id').single();
    if (!error && data) { invalidate(); redirect(`/admin/links/${data.id}`); }
    if (error?.code !== '23505') return { error: 'Could not create the link. Please try again.' };
    if (slug) return { error: 'That slug is already reserved. Choose another.' };
  }
  return { error: 'Could not allocate a slug. Please try again.' };
}

export async function changeLinkStatus(_state: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireExecutive();
  const id = String(form.get('id') ?? '');
  const version = String(form.get('updated_at') ?? '');
  const action = String(form.get('operation') ?? '');
  if (!z.uuid().safeParse(id).success || !['pause', 'resume', 'archive', 'restore'].includes(action) || !z.iso.datetime({ offset: true }).safeParse(version).success) return { error: 'Invalid link action.' };
  // Restoring leaves the link paused, so an old destination cannot silently go live.
  const changes = action === 'archive' ? { archived_at: new Date().toISOString() }
    : action === 'restore' ? { archived_at: null, is_active: false }
    : { is_active: action === 'resume' };
  const { data, error } = await supabase.from('short_links').update(changes).eq('id', id).eq('updated_at', version).select('id').maybeSingle();
  if (error) return { error: 'Could not change the link status.' };
  if (!data) return { error: 'This link changed. Reload the page and try again.' };
  invalidate(id);
  return { success: action === 'restore' ? 'Restored and paused. Review the destination before resuming.' : 'Link status updated.' };
}

export async function updateExecutiveAccess(_state: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireExecutive(true);
  const ids = [...new Set(form.getAll('account_ids').map(String))];
  const operation = String(form.get('operation'));
  if (!z.array(z.uuid()).min(1).max(50).safeParse(ids).success || !['grant', 'revoke'].includes(operation)) return { error: 'Select between 1 and 50 accounts.' };
  const { error } = await supabase.rpc('set_executive_access', { account_ids: ids, grant_access: operation === 'grant' });
  if (error) return { error: 'Could not change access. Your owner account cannot be changed here; refresh the account list and try again.' };
  revalidatePath('/admin/access');
  revalidatePath('/dashboard');
  return { success: operation === 'grant' ? 'Admin access granted to the selected accounts.' : 'Admin access removed. Their accounts and profiles remain intact.' };
}
