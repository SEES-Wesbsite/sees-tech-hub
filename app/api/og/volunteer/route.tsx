import { ImageResponse } from '@vercel/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEADLINE_MS, recruitmentState } from '@/app/volunteer/recruitment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Read the existing CSS tokens: social images cannot resolve CSS custom properties.
async function loadAssets() {
  const [css, svg, sans, serif] = await Promise.all([
    readFile(join(process.cwd(), 'app/globals.css'), 'utf8'),
    readFile(join(process.cwd(), 'public/logo/logomark.svg'), 'utf8'),
    readFile(join(process.cwd(), 'node_modules/@vercel/og/dist/Geist-Regular.ttf')),
    readFile(join(process.cwd(), 'public/fonts/og/InstrumentSerif-Regular.ttf')),
  ]);
  const token = (name: string) => {
    const value = css.match(new RegExp('--scholarship-' + name + ':\\s*([^;]+);'))?.[1].trim();
    if (!value) throw new Error('Missing campaign color: ' + name);
    return value;
  };
  // Crop the supplied vector's canvas without changing its artwork.
  const logo = svg.replace(/viewBox="[^"]+"/, 'viewBox="440 295 615 615"');
  return {
    colors: { paper: token('paper'), ink: token('ink'), green: token('green'), mint: token('mint'), gold: token('gold') },
    logo: 'data:image/svg+xml;base64,' + Buffer.from(logo).toString('base64'),
    sans, serif,
  };
}

let assets: ReturnType<typeof loadAssets> | undefined;

export async function GET() {
  // Retry asset loading after a failed attempt rather than caching a rejected promise.
  assets ??= loadAssets().catch((error) => { assets = undefined; throw error; });
  const { colors, logo, sans, serif } = await assets;
  const now = Date.now();
  const closed = recruitmentState(now).closed;
  const ttl = closed ? 86400 : Math.max(0, Math.min(3600, Math.floor((DEADLINE_MS - now) / 1000)));
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '48px 56px', background: colors.paper, color: colors.ink, fontFamily: 'Geist' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', padding: 8, width: 62, height: 62, borderRadius: 62, background: colors.ink }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={46} height={46} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: -1 }}>SEES</span>
            <span style={{ fontSize: 10, letterSpacing: 2, marginTop: 2 }}>TECH HUB</span>
          </div>
        </div>
        <span style={{ fontSize: 15, letterSpacing: 2, color: colors.green }}>VOLUNTEER INTAKE · OCTOBER 2026</span>
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 704 }}>
          <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', padding: '9px 14px', borderRadius: 5, background: closed ? colors.mint : colors.gold, fontSize: 16, fontWeight: 700, marginBottom: 24 }}>
            {closed ? 'Applications closed' : 'Volunteer applications are open'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, lineHeight: 1.05, letterSpacing: -3, fontWeight: 700 }}>
            <span>Good things take</span><span>good people.</span>
          </div>
          <span style={{ fontSize: 23, marginTop: 25, lineHeight: 1.5, color: colors.green }}>Bring your skills. Find your people.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 310, height: 334, flexShrink: 0, background: colors.ink, color: colors.paper, borderRadius: 16, padding: '27px 25px' }}>
          <span style={{ fontSize: 12, letterSpacing: 2, color: colors.mint }}>{closed ? 'APPLICATIONS CLOSED' : 'APPLICATIONS CLOSE'}</span>
          <span style={{ fontFamily: 'Instrument Serif', fontSize: 142, lineHeight: 1, marginTop: 8 }}>18</span>
          <span style={{ fontSize: 26, marginTop: 0 }}>October 2026</span>
          <span style={{ fontSize: 17, color: colors.mint, marginTop: 18 }}>Sunday · 11:59 PM WAT</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid ' + colors.mint, paddingTop: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 15, color: colors.green }}>
          <span>Content · Design · Development · Operations</span>
          <span>Growth &amp; Outreach · Community &amp; Events · Finance &amp; Sponsorship</span>
        </div>
        <span style={{ fontSize: 15 }}>tech.seesunilag.com/volunteer</span>
      </div>
    </div>,
    {
      width: 1200, height: 630,
      fonts: [
        { name: 'Geist', data: sans, weight: 400, style: 'normal' },
        { name: 'Instrument Serif', data: serif, weight: 400, style: 'normal' },
      ],
      headers: { 'Cache-Control': ttl === 0 ? 'no-store' : 'public, max-age=0, s-maxage=' + ttl },
    },
  );
}
