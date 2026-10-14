import Link from 'next/link';
import { Link2, Users, ArrowRight } from 'lucide-react';
import { requireExecutive } from '@/lib/executive-access';
import { PageHeading } from '@/components/admin/ui';

export default async function ExecutiveHubPage() {
  const { role, supabase } = await requireExecutive();
  const { count, error } = await supabase.from('short_links').select('id', { count: 'exact', head: true }).is('archived_at', null);
  if (error) throw new Error('Could not load the executive hub.');
  return <><PageHeading eyebrow="For the people behind the hub" title="A little more room to make things happen." description="Your shared workspace for the tools that keep SEES Tech Hub running." /><div className="grid gap-6 md:grid-cols-2"><Link href="/admin/links" className="group rounded-3xl border border-border bg-card p-8 transition-colors hover:border-brand/40 hover:bg-secondary"><Link2 className="mb-10 size-7 text-brand" /><p className="text-sm text-muted-foreground">{count ?? 0} unarchived links</p><h2 className="mt-2 font-serif text-3xl">Short links</h2><p className="mt-3 leading-relaxed text-muted-foreground">Create memorable addresses, control when they go live, and follow their reach.</p><span className="mt-8 flex items-center gap-2 text-sm font-medium text-brand">Open link manager <ArrowRight size={16} /></span></Link>{role === 'super_admin' && <Link href="/admin/access" className="group rounded-3xl border border-border p-8 transition-colors hover:border-brand/40 hover:bg-secondary"><Users className="mb-10 size-7 text-brand" /><p className="text-sm text-muted-foreground">Owner controls</p><h2 className="mt-2 font-serif text-3xl">The executive team</h2><p className="mt-3 leading-relaxed text-muted-foreground">Find existing accounts and grant or remove admin access in one place.</p><span className="mt-8 flex items-center gap-2 text-sm font-medium text-brand">Manage access <ArrowRight size={16} /></span></Link>}</div><p className="text-sm text-muted-foreground">Links belong to the hub. Every executive can manage them, and changes are recorded.</p></>;
}
