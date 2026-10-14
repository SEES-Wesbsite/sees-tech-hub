import { NextResponse } from 'next/server';
import { resolvePublicLink } from '@/lib/public-short-links';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow' };
async function respond(request: Request, params: Promise<{ slug: string }>, kind: 'visit' | 'continue' | 'inspect') {
  const { slug } = await params;
  const preview = new URL(`/go/${encodeURIComponent(slug)}/preview`, request.url);
  try {
    const result = await resolvePublicLink(slug, kind);
    if (result.state === 'redirect' && result.destination_url) {
      const target = new URL(result.destination_url);
      if (target.origin === new URL(request.url).origin && target.pathname === `/go/${slug}`) return NextResponse.redirect(preview, { status: 303, headers });
      return NextResponse.redirect(target, { status: kind === 'continue' ? 303 : 307, headers });
    }
  } catch {
    // The preview renders a branded unavailable state and does not count traffic.
  }
  return NextResponse.redirect(preview, { status: 303, headers });
}
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const speculative = request.headers.has('next-router-prefetch') || /prefetch/i.test(`${request.headers.get('purpose')} ${request.headers.get('sec-purpose')}`);
  return respond(request, params, speculative ? 'inspect' : 'visit');
}
export async function HEAD(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return respond(request, params, 'inspect');
}
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new NextResponse('Forbidden', { status: 403, headers });
  return respond(request, params, 'continue');
}
