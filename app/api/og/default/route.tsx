import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Default values if not provided
    const title = searchParams.get('title') || 'SEES Tech Hub'
    const description = searchParams.get('description') || 'The exclusive portal for SEES builders.'

    // Brand colors from globals.css:
    // Dark mode background: #0a0a0a
    // Brand (dark): #10b981
    // Brand accent: #95fde2

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            padding: '80px',
            color: 'white',
            textAlign: 'center',
            backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(16, 185, 129, 0.2) 0%, rgba(10, 10, 10, 1) 100%)',
          }}
        >
          {/* Logo representation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '48px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://tech.seesunilag.com/logo-mark.svg" 
              alt="SEES Tech Hub Logo" 
              width="120" 
              height="120"
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'white',
              margin: '0 0 24px 0',
              maxWidth: '1000px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: 32,
              color: '#a3a3a3',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {description}
          </p>
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
