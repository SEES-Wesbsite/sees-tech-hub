import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireExecutive } from '@/lib/executive-access';
import { linkState, linkStates, formatLagos } from '@/lib/short-links';
import { buttonClass, fieldClass, secondaryButtonClass, PageHeading, StatusBadge } from '@/components/admin/ui';
import { CopyLink } from '@/components/admin/copy-link';

export default async function AdminLinksPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { supabase } = await requireExecutive();
  const params = await searchParams;
  const q = (params.q ?? '').slice(0, 200).replace(/[^a-zA-Z0-9 .:/-]/g, '').trim();
  const status = linkStates.find((value) => value === params.status) ?? 'all';
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1));
  const now = new Date().toISOString();
  let query = supabase.from('short_links').select('*', { count: 'exact' });
  if (q) query = query.or(`slug.ilike.%${q}%,description.ilike.%${q}%,destination_url.ilike.%${q}%`);
  if (status === 'archived') query = query.not('archived_at', 'is', null);
  else if (status !== 'all') {
    query = query.is('archived_at', null);
    if (status === 'paused') query = query.eq('is_active', false);
    else {
      query = query.eq('is_active', true);
      if (status === 'expired') query = query.lte('expires_at', now);
      else {
        query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
        if (status === 'scheduled') query = query.gt('starts_at', now);
        else query = query.or(`starts_at.is.null,starts_at.lte.${now}`);
      }
    }
  }
  const { data, count, error } = await query.order('created_at', { ascending: false }).order('id').range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error('Could not load short links. Please try again.');
  const pageUrl = (n: number) => `/admin/links?${new URLSearchParams({ q, status, page: String(n) })}`;
  return <><PageHeading eyebrow="Executive tools" title="Small links. Wider reach." description="A shared home for the hub’s links, from the first visit to the final click."><Link href="/admin/links/new" className={buttonClass}><Plus size={16} />Create link</Link></PageHeading>
    <form className="grid items-end gap-4 sm:grid-cols-[1fr_180px_auto]" role="search"><label className="space-y-2"><span className="text-sm font-medium">Search links</span><input name="q" className={fieldClass} defaultValue={q} placeholder="Slug, destination or internal note" maxLength={200} /></label><label className="space-y-2"><span className="text-sm font-medium">Status</span><select name="status" className={fieldClass} defaultValue={status}><option value="all">All links</option>{linkStates.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label><button className={secondaryButtonClass}>Apply filters</button></form>
    <section aria-label="Short links" className="overflow-hidden rounded-3xl border border-border"><div className="border-b border-border bg-card px-6 py-4 text-sm text-muted-foreground">{count ?? 0} matching links</div>{!data?.length ? <p className="p-10 text-center text-muted-foreground">No links match these filters.</p> : data.map((link) => <article key={link.id} className="flex flex-wrap items-center justify-between gap-6 border-b border-border p-6 last:border-0"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><Link className="break-all text-lg font-semibold text-brand underline-offset-4 hover:underline" href={`/admin/links/${link.id}`}>/go/{link.slug}</Link><StatusBadge state={linkState(link, Date.parse(now))} /></div>{link.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{link.description}</p>}<p className="mt-2 truncate text-sm text-muted-foreground">{link.destination_url}</p><p className="mt-3 text-xs text-muted-foreground">{link.clicks.toLocaleString()} onward requests · Created {formatLagos(link.created_at)}</p></div><CopyLink slug={link.slug} /></article>)}</section>
    <nav aria-label="Link list pages" className="flex items-center justify-between gap-4"><div>{page > 1 && <Link className={secondaryButtonClass} href={pageUrl(page - 1)}>Previous</Link>}</div><span className="text-sm text-muted-foreground">Page {page}</span><div>{page * 20 < (count ?? 0) && <Link className={secondaryButtonClass} href={pageUrl(page + 1)}>Next</Link>}</div></nav>
  </>;
}
