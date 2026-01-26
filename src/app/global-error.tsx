'use client';

import { WifiOff } from 'lucide-react';

export default function GlobalError({
  error: _error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#160f09',
          color: '#f3e9e2',
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <WifiOff
          size={48}
          style={{ color: '#f3e9e2', opacity: 0.6, marginBottom: '1.5rem' }}
        />
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#f3e9e2',
          }}
        >
          Oops! Something went wrong.
        </h1>
        <p
          style={{
            marginBottom: '2rem',
            opacity: 0.7,
            color: '#f3e9e2',
          }}
        >
          We&apos;re working on it.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#6655b8',
            color: '#f3e9e2',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
