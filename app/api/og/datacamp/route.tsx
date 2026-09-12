import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

const colors = {
  paper: '#FFFFFF',
  ink: '#0B3D2E',
  green: '#1E7A57',
  mint: '#8FF0D6',
  gold: '#FFB703',
  border: '#D7E5DF',
} as const;

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const dataCampLogo = `${origin}/datacamp/WhatsApp%20Image%202026-09-10%20at%2021.13.28%20(1).jpeg`;

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden',
      flexDirection: 'column', justifyContent: 'space-between', padding: '54px 64px',
      color: colors.ink, backgroundColor: colors.paper, fontFamily: 'Arial, sans-serif',
      backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
      backgroundSize: '72px 72px',
    }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.84) 58%, rgba(255,255,255,.42) 100%)' }} />
      <div style={{ position: 'absolute', width: 460, height: 460, right: -120, bottom: -210, borderRadius: 460, backgroundColor: colors.mint, opacity: .5 }} />
      <div style={{ position: 'absolute', width: 18, height: 18, right: 76, top: 171, borderRadius: 18, backgroundColor: colors.gold }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 64, backgroundColor: colors.ink }}>
            <svg width="46" height="46" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="16" r="10" fill={colors.paper} />
              <circle cx="48" cy="32" r="10" fill={colors.paper} />
              <circle cx="32" cy="48" r="10" fill={colors.paper} />
              <circle cx="16" cy="32" r="10" fill={colors.paper} />
              <path d="M32 16L48 32L32 48L16 32Z" fill={colors.paper} />
              <circle cx="32" cy="32" r="7" fill={colors.green} />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1.5px' }}>SEES</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', marginTop: 7 }}>TECH HUB</span>
          </div>
        </div>
        <div style={{ display: 'flex', width: 270, height: 58, overflow: 'hidden', borderRadius: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataCampLogo} alt="" width="270" height="58" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', maxWidth: 930 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span style={{ width: 36, height: 3, display: 'flex', backgroundColor: colors.green }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '2.8px', textTransform: 'uppercase', color: colors.green }}>500 scholarships</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 79, fontWeight: 800, lineHeight: .98, letterSpacing: '-4.7px' }}>
          <span>Build real data skills.</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 12 }}>
            <span>On us.</span>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontStyle: 'italic', color: colors.green }}>Start here.</span>
          </span>
        </div>
        <span style={{ marginTop: 30, fontSize: 24, lineHeight: 1.45, color: colors.green }}>
          Free DataCamp access for students ready to grow in data, AI and tech.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>tech.seesunilag.com/datacamp</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderRadius: 8, backgroundColor: colors.gold, fontSize: 17, fontWeight: 800 }}>
          Apply for a scholarship <span>↗</span>
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400' },
    },
  );
}
