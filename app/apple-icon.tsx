import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '24px', // Add some padding so the logo doesn't touch the edges of the icon
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://tech.seesunilag.com/logo-mark.svg" 
          alt="STH Logo"
          width="100%"
          height="100%"
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
