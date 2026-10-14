import { requireExecutive } from '@/lib/executive-access';
import { AccountSelection } from '@/components/admin/account-selection';
import { PageHeading, fieldClass, secondaryButtonClass } from '@/components/admin/ui';
import { formatLagos } from '@/lib/short-links';

export default async function AdminAccessPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await requireExecutive(true);
  const { q = '' } = await searchParams;
  const query = q.trim().slice(0, 254);
  const [{ data: accounts, error }, { data: history, error: historyError }] = await Promise.all([
    supabase.rpc('search_executive_accounts', { search_email: query }),
    supabase.from('executive_audit').select('*').eq('category', 'access').order('created_at', { ascending: false }).limit(20),
  ]);
  if (error || historyError) throw new Error('Could not load admin access.');
  return <><PageHeading eyebrow="Owner controls" title="Good people. The right access." description="Search existing accounts by email, select the people you want, then update their access together. All admins share the same executive tools." /><form role="search" className="flex flex-wrap items-end gap-4"><label className="min-w-0 flex-1 space-y-2"><span className="text-sm font-medium">Find an account by email</span><input className={fieldClass} name="q" type="search" defaultValue={query} maxLength={254} placeholder="Enter at least 3 characters" /></label><button className={secondaryButtonClass}>Search accounts</button><a className="py-3 text-sm text-brand underline" href="/admin/access">Current admins</a></form><p className="text-sm text-muted-foreground">{query ? 'Up to 50 matching accounts. Narrow the email search if needed.' : 'Showing current admins. Your owner access is protected.'}</p><AccountSelection key={query} accounts={accounts ?? []} /><section className="space-y-4 border-t border-border pt-8"><h2 className="text-xl font-semibold">Recent access changes</h2>{!history?.length && <p className="text-sm text-muted-foreground">Access changes will appear here.</p>}{history?.map((entry) => <p key={entry.id} className="break-words text-sm text-muted-foreground"><span className="font-medium text-foreground">{entry.actor_name}</span> {entry.action} access · {String(entry.details.account_email ?? entry.target_id)} · {formatLagos(entry.created_at)}</p>)}</section></>;
}

