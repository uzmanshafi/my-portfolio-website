'use client';

import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Structured console logging
  useEffect(() => {
    console.error(
      JSON.stringify({
        type: 'RenderError',
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      })
    );
  }, [error]);

  // R key shortcut for retry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      <WifiOff
        size={48}
        className="mb-6"
        style={{ color: 'var(--color-text)', opacity: 0.6 }}
      />
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        Oops! Something went wrong.
      </h1>
      <p
        className="mb-8 text-center max-w-md"
        style={{ color: 'var(--color-text)', opacity: 0.7 }}
      >
        We&apos;re working on it.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-text)',
        }}
      >
        Try again
      </button>
    </main>
  );
}
