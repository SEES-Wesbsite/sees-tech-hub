'use client';
import { useActionState, useState } from 'react';
import { updateExecutiveAccess } from '@/app/actions/admin-links';
import type { ActionResult, ExecutiveAccount } from '@/lib/short-links';
import { buttonClass, secondaryButtonClass } from './ui';

export function AccountSelection({ accounts }: { accounts: ExecutiveAccount[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [state, action, pending] = useActionState(async (previous: ActionResult, form: FormData) => {
    const result = await updateExecutiveAccess(previous, form);
    if (result.success) setSelected([]);
    return result;
  }, {});
  const selectable = accounts.filter((account) => account.access_role !== 'super_admin');
  return <form action={action} className="space-y-5" onSubmit={(event) => {
    const operation = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
    if (operation === 'revoke' && !window.confirm(`Remove admin access for ${selected.length} selected accounts? Their profiles and links will stay intact.`)) event.preventDefault();
  }}><fieldset disabled={pending} className="overflow-hidden rounded-3xl border border-border"><legend className="sr-only">Select accounts to manage</legend><div className="border-b border-border bg-card p-5"><label className="flex items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-brand" checked={selectable.length > 0 && selected.length === selectable.length} disabled={!selectable.length} onChange={(e) => setSelected(e.target.checked ? selectable.map((a) => a.user_id) : [])} />Select all eligible results</label></div>{!accounts.length && <p className="p-8 text-muted-foreground">No matching accounts. They need to sign in to the hub first.</p>}{accounts.map((account) => <label key={account.user_id} className="flex items-start gap-4 border-b border-border p-5 last:border-0"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-brand" name="account_ids" value={account.user_id} disabled={account.access_role === 'super_admin'} checked={selected.includes(account.user_id)} onChange={(e) => setSelected(e.target.checked ? [...selected, account.user_id] : selected.filter((id) => id !== account.user_id))} /><span className="min-w-0 flex-1"><span className="block break-all font-medium">{account.email}</span><span className="mt-1 block text-sm text-muted-foreground">{account.full_name}</span></span><span className="text-xs text-muted-foreground">{account.access_role === 'super_admin' ? 'You · Owner' : account.access_role === 'admin' ? 'Admin' : 'Member'}</span></label>)}</fieldset><div className="flex flex-wrap items-center gap-3"><span className="mr-auto text-sm text-muted-foreground">{selected.length} selected</span><button name="operation" value="revoke" className={secondaryButtonClass} disabled={!selected.length || pending}>Remove admin access</button><button name="operation" value="grant" className={buttonClass} disabled={!selected.length || pending}>{pending ? 'Updating…' : 'Make admin'}</button></div><div aria-live="polite">{state.error && <p role="alert" className="text-destructive">{state.error}</p>}{state.success && <p className="text-brand">{state.success}</p>}</div></form>;
}

