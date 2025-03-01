import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Justin P Barnett - Interactive portfolio with AI-powered chat';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          fontFamily: 'JetBrains Mono',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              letterSpacing: '-0.05em',
              color: 'white',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Justin P Barnett
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#9CA3AF',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Interactive portfolio with AI-powered chat
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 