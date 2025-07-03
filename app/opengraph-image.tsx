import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Best JSON Compare - Professional JSON Tools'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ 
            fontSize: 72, 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
            backgroundClip: 'text',
            color: 'transparent',
            margin: 0
          }}>
            Best JSON Compare
          </h1>
          <p style={{ 
            fontSize: 32, 
            color: '#D1D5DB',
            textAlign: 'center',
            margin: '20px 0 0 0'
          }}>
            Professional JSON Tools
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '20px',
            marginTop: '40px',
            fontSize: 24,
            color: '#9CA3AF'
          }}>
            <span>Compare</span>
            <span>•</span>
            <span>Format</span>
            <span>•</span>
            <span>Validate</span>
            <span>•</span>
            <span>Repair</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}