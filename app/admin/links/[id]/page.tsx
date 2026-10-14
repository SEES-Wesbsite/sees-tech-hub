import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireExecutive } from '@/lib/executive-access';
import { formatLagos, linkState, utcToLagos } from '@/lib/short-links';
import { BackToLinks, PageHeading, StatusBadge, secondaryButtonClass } from '@/components/admin/ui';
import { LinkForm, LinkStatusControls } from '@/components/admin/link-form';
import { CopyLink } from '@/components/admin/copy-link';
import { TrafficChart } from '@/components/admin/traffic-chart';

const fieldLabels: Record<string, string> = { destination_url: 'Destination', description: 'Internal note', starts_at: 'Activation', expires_at: 'Expiry', archived_at: 'Archived', is_active: 'Enabled', intro_enabled: 'Introduction enabled', intro_title: 'Public title', intro_message: 'Public message', intro_button: 'Button label', created_by: 'Creator' };
function displayValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key.endsWith('_at') && typeof value === 'string') return formatLagos(value);
  return String(value);
}
export default async function LinkDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ history?: string }> }) {
  const { supabase } = await requireExecutive();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const historyPage = Math.max(1, Math.min(100000, Number.parseInt((await searchParams).history ?? '1', 10) || 1));
  const today = utcToLagos(new Date().toISOString()).slice(0, 10);
  const dates = Array.from({ length: 30 }, (_, index) => new Date(Date.parse(`${today}T12:00:00Z`) - (29 - index) * 86400000).toISOString().slice(0, 10));
  const [{ data: link, error }, { data: traffic, error: trafficError }, { data: history, count, error: historyError }] = await Promise.all([
    supabase.from('short_links').select('*').eq('id', id).maybeSingle(),
    supabase.from('short_link_daily').select('*').eq('link_id', id).gte('day', dates[0]).lte('day', today).order('day'),
    supabase.from('executive_audit').select('*', { count: 'exact' }).eq('category', 'link').eq('target_id', id).order('created_at', { ascending: false }).order('id').range((historyPage - 1) * 20, historyPage * 20 - 1),
  ]);
  if (error || trafficError || historyError) throw new Error('Could not load this link.');
  if (!link) notFound();
  const { data: creator, error: creatorError } = link.created_by ? await supabase.from('users').select('full_name').eq('id', link.created_by).maybeSingle() : { data: null, error: null };
  if (creatorError) throw new Error('Could not load the link creator.');
  const points = dates.map((day) => ({ day, visits: traffic?.find((row) => row.day === day)?.visits ?? 0, clicks: traffic?.find((row) => row.day === day)?.clicks ?? 0 }));
  return <><BackToLinks /><PageHeading eyebrow="Link workspace" title={`/go/${link.slug}`} description={`Created ${formatLagos(link.created_at)} · ${creator?.full_name ?? 'Former member'}`}><div className="flex flex-wrap items-start gap-3"><StatusBadge state={linkState(link)} /><CopyLink slug={link.slug} /></div></PageHeading>
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: 'All-time onward requests', value: link.clicks }, { label: 'Visits · last 30 days', value: points.reduce((sum, point) => sum + point.visits, 0) }, { label: 'Onward requests · last 30 days', value: points.reduce((sum, point) => sum + point.clicks, 0) }].map((metric) => <div key={metric.label} className="rounded-2xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-4 text-3xl font-medium tabular-nums">{metric.value.toLocaleString()}</p></div>)}</div>
    <p className="text-sm leading-relaxed text-muted-foreground">Visits count requests to the short address. Onward requests count redirects to the destination, including Continue submissions. These are not unique people and can include automated traffic. Daily tracking begins with the new shortener; existing totals are preserved and may be incomplete.</p>
    <section className="rounded-3xl border border-border p-6 sm:p-8"><TrafficChart points={points} /></section>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="min-w-0 rounded-3xl border border-border p-6 sm:p-8"><LinkForm link={link} /></section><aside className="space-y-8 rounded-3xl bg-card p-6"><div><h2 className="mb-4 text-xl font-semibold">Availability</h2><LinkStatusControls link={link} /></div><div className="border-t border-border pt-6"><h2 className="text-lg font-semibold">Visitor experience</h2><p className="my-3 text-sm leading-relaxed text-muted-foreground">Preview the current introduction or availability message without recording a visit.</p><Link className={secondaryButtonClass} href={`/go/${encodeURIComponent(link.slug)}/preview`} target="_blank" rel="noopener noreferrer" prefetch={false}>Preview page</Link></div></aside></div>
    <section className="space-y-5 border-t border-border pt-8"><h2 className="text-2xl font-serif">Change history</h2>{!history?.length && <p className="text-sm text-muted-foreground">Earlier edits were not recorded. New changes will appear here.</p>}{history?.map((entry) => {
      const before = (entry.details.before ?? {}) as Record<string, unknown>;
      const after = (entry.details.after ?? {}) as Record<string, unknown>;
      return <article key={entry.id} className="rounded-2xl border border-border p-5"><p className="text-sm"><strong>{entry.actor_name}</strong> {entry.action} this link</p><p className="mt-1 text-xs text-muted-foreground">{formatLagos(entry.created_at)}</p><dl className="mt-4 space-y-3">{Object.entries(fieldLabels).filter(([key]) => JSON.stringify(before[key]) !== JSON.stringify(after[key])).map(([key, label]) => <div key={key} className="text-sm"><dt className="font-medium">{label}</dt><dd className="mt-1 break-words whitespace-pre-wrap text-muted-foreground">{entry.action === 'updated' && <><span>{displayValue(key, before[key])}</span><span className="mx-2">→</span></>}{displayValue(key, after[key])}</dd></div>)}</dl></article>;
    })}<nav aria-label="History pages" className="flex justify-between">{historyPage > 1 ? <Link className={secondaryButtonClass} href={`?history=${historyPage - 1}`}>Newer changes</Link> : <span />}{historyPage * 20 < (count ?? 0) && <Link className={secondaryButtonClass} href={`?history=${historyPage + 1}`}>Older changes</Link>}</nav></section>
  </>;
}

