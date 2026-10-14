'use client';
import { useActionState, useState } from 'react';
import { saveShortLink, changeLinkStatus } from '@/app/actions/admin-links';
import { utcToLagos, type ShortLink } from '@/lib/short-links';
import { buttonClass, fieldClass, secondaryButtonClass } from './ui';

export function LinkForm({ link }: { link?: ShortLink }) {
  const [state, action, pending] = useActionState(saveShortLink, {});
  const [intro, setIntro] = useState(link?.intro_enabled ?? false);
  return <form action={action} className="space-y-8">
    {link && <><input type="hidden" name="id" value={link.id} /><input type="hidden" name="updated_at" value={link.updated_at} /></>}
    <fieldset disabled={pending} className="space-y-6">
      <legend className="mb-5 text-xl font-semibold">Link details</legend>
      <label className="block space-y-2"><span>Destination URL</span><input className={fieldClass} type="url" name="destination_url" required maxLength={4096} defaultValue={link?.destination_url} placeholder="https://example.com" /></label>
      {!link ? <label className="block space-y-2"><span>Custom slug <span className="text-muted-foreground">(optional)</span></span><div className="flex items-center gap-2"><span className="text-muted-foreground">/go/</span><input className={fieldClass} name="slug" maxLength={50} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="your-link" /></div><span className="block text-sm text-muted-foreground">Leave blank to generate one. Published slugs are permanent.</span></label> : <p className="break-all text-sm text-muted-foreground">Published address: /go/{link.slug}. This address stays reserved.</p>}
      <label className="block space-y-2"><span>Internal note <span className="text-muted-foreground">(optional)</span></span><textarea className={fieldClass} name="description" rows={2} maxLength={1000} defaultValue={link?.description ?? ''} /><span className="block text-sm text-muted-foreground">Only executives can see this.</span></label>
    </fieldset>
    <fieldset disabled={pending} className="space-y-4 border-t border-border pt-6">
      <legend className="px-1 text-xl font-semibold">Schedule</legend><p className="text-sm text-muted-foreground">All times are West Africa Time (WAT, UTC+1). Leave blank for immediate activation or no expiry.</p>
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2"><span className="block">Activate on</span><input type="datetime-local" name="starts_at" className={fieldClass} defaultValue={utcToLagos(link?.starts_at ?? null)} /></label><label className="space-y-2"><span className="block">Expire on</span><input type="datetime-local" name="expires_at" className={fieldClass} defaultValue={utcToLagos(link?.expires_at ?? null)} /></label></div>
    </fieldset>
    <fieldset disabled={pending} className="space-y-5 border-t border-border pt-6">
      <legend className="px-1 text-xl font-semibold">Before the destination</legend>
      <label className="flex items-start gap-3"><input className="mt-1 size-5 accent-brand" type="checkbox" name="intro_enabled" checked={intro} onChange={(e) => setIntro(e.target.checked)} /><span>Show an introduction page<span className="mt-1 block text-sm text-muted-foreground">Visitors read your message and choose when to continue.</span></span></label>
      <div hidden={!intro} className="space-y-5 rounded-2xl bg-secondary p-5">
        <label className="block space-y-2"><span>Public title</span><input className={fieldClass} name="intro_title" required={intro} maxLength={160} defaultValue={link?.intro_title ?? ''} /></label>
        <label className="block space-y-2"><span>Public message</span><textarea className={fieldClass} name="intro_message" required={intro} rows={4} maxLength={2000} defaultValue={link?.intro_message ?? ''} /><span className="block text-sm text-muted-foreground">Plain text, up to 2,000 characters.</span></label>
        <label className="block space-y-2"><span>Button label</span><input className={fieldClass} name="intro_button" maxLength={60} defaultValue={link?.intro_button ?? 'Continue'} /></label>
      </div>
    </fieldset>
    <div aria-live="polite">{state.error && <p role="alert" className="text-destructive">{state.error}</p>}{state.success && <p className="text-brand">{state.success}</p>}</div>
    <button className={buttonClass} disabled={pending}>{pending ? 'Saving…' : link ? 'Save changes' : 'Create short link'}</button>
  </form>;
}

export function LinkStatusControls({ link }: { link: ShortLink }) {
  const [state, action, pending] = useActionState(changeLinkStatus, {});
  return <form action={action} className="space-y-3">
    <input type="hidden" name="id" value={link.id} /><input type="hidden" name="updated_at" value={link.updated_at} />
    <div className="flex flex-wrap gap-3">{link.archived_at ? <button className={secondaryButtonClass} disabled={pending} name="operation" value="restore">Restore as paused</button> : <><button className={secondaryButtonClass} disabled={pending} name="operation" value={link.is_active ? 'pause' : 'resume'}>{link.is_active ? 'Pause link' : 'Resume link'}</button><button className={secondaryButtonClass} disabled={pending} name="operation" value="archive">Archive link</button></>}</div>
    <p className="text-sm text-muted-foreground">Archiving preserves the address, settings and history. Restoring leaves the link paused.</p>
    <div aria-live="polite">{state.error && <p role="alert" className="text-destructive">{state.error}</p>}{state.success && <p className="text-brand">{state.success}</p>}</div>
  </form>;
}
