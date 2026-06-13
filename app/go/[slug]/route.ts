import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const p = await params
  const slug = p.slug

  if (!slug) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 1. Increment clicks safely
  // We use the rpc 'increment_short_link_clicks' which we should define if we want an atomic increment,
  // but for simplicity and without a new migration, we can just fetch and update.
  // Wait, Supabase doesn't support atomic increments out of the box without RPC.
  // We will do a standard fetch-and-update. In a high-traffic scenario, this might drop some counts,
  // but it's acceptable for an MVP shortener.
  const { data: link } = await supabase
    .from('short_links')
    .select('id, original_url, clicks')
    .eq('slug', slug)
    .single()

  if (!link) {
    // If not found, redirect to a fallback
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Fire-and-forget update
  supabase
    .from('short_links')
    .update({ clicks: link.clicks + 1 })
    .eq('id', link.id)
    .then()

  return NextResponse.redirect(link.original_url)
}
