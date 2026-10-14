'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { secondaryButtonClass } from './ui';
export function CopyLink({ slug }: { slug: string }) {
  const [message, setMessage] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/go/${encodeURIComponent(slug)}`); setMessage('Copied'); }
    catch { setMessage('Could not copy. Copy the address below.'); }
  }
  return <div><button type="button" className={secondaryButtonClass} onClick={copy}>{message === 'Copied' ? <Check size={16} /> : <Copy size={16} />}Copy link</button><p aria-live="polite" className="mt-2 text-sm text-muted-foreground">{message}</p>{message.startsWith('Could not') && <input aria-label="Short link address" readOnly className="w-full" value={`${window.location.origin}/go/${encodeURIComponent(slug)}`} onFocus={(event) => event.target.select()} />}</div>;
}
