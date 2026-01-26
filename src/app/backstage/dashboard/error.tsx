'use client';

import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Structured console logging with stack trace for admin
  useEffect(() => {
    console.error(
      JSON.stringify({
        type: 'AdminDashboardError',
        message: error.message,
        digest: error.digest,
        stack: error.stack,
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
        Dashboard Error
      </h1>
      <p
        className="mb-4 text-center max-w-md"
        style={{ color: 'var(--color-text)', opacity: 0.7 }}
      >
        Something went wrong loading this page.
      </p>

      {/* Technical details visible on admin page */}
      <div
        className="mb-8 p-4 rounded-lg max-w-lg w-full"
        style={{
          backgroundColor: 'rgba(243, 233, 226, 0.05)',
          border: '1px solid rgba(243, 233, 226, 0.1)',
        }}
      >
        <p
          className="text-sm font-mono break-all"
          style={{ color: 'var(--color-text)', opacity: 0.6 }}
        >
          {error.message}
        </p>
        {error.digest && (
          <p
            className="text-xs font-mono mt-2"
            style={{ color: 'var(--color-text)', opacity: 0.4 }}
          >
            Digest: {error.digest}
          </p>
        )}
      </div>

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
