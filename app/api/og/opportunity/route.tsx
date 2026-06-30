import { ImageResponse } from '@vercel/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new Response('Missing ID', { status: 400 })
    }

    const supabase = await createClient()
    const { data: opp } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single()

    if (!opp) {
      return new Response('Not Found', { status: 404 })
    }

    // Brand colors from globals.css:
    // Dark mode background: #0a0a0a
    // Brand (dark): #10b981
    // Brand accent: #95fde2
    // Card: #171717

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0a',
            padding: '72px 80px',
            color: 'white',
          }}
        >
          {/* Top: badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {opp.organization.toUpperCase()}
            </div>
            <div
              style={{
                backgroundColor: '#171717',
                color: '#a3a3a3',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: 22,
                fontWeight: 600,
                border: '1px solid #262626',
              }}
            >
              {opp.opportunity_type.charAt(0).toUpperCase() + opp.opportunity_type.slice(1)}
            </div>
          </div>

          {/* Center: title + summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '920px' }}>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'white',
                margin: 0,
              }}
            >
              {opp.title.length > 60 ? opp.title.substring(0, 60) + '...' : opp.title}
            </h1>

            <p
              style={{
                fontSize: 28,
                color: '#a3a3a3',
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {opp.summary.length > 120 ? opp.summary.substring(0, 120) + '...' : opp.summary}
            </p>
          </div>

          {/* Bottom: meta + branding */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#a3a3a3', fontSize: 24, gap: '8px' }}>
                <span style={{ fontSize: 22 }}>📍</span>
                <span>{opp.location_type.charAt(0).toUpperCase() + opp.location_type.slice(1)}{opp.location ? ` • ${opp.location}` : ''}</span>
              </div>
              {opp.compensation && (
                <div style={{ display: 'flex', alignItems: 'center', color: '#a3a3a3', fontSize: 24, gap: '8px' }}>
                  <span style={{ fontSize: 22 }}>💰</span>
                  <span>{opp.compensation}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#10b981',
                  borderRadius: '8px',
                }}
              />
              <span style={{ fontSize: 26, fontWeight: 700, color: '#10b981' }}>SEES Tech Hub</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response(`Failed to generate image`, { status: 500 })
  }
}
