import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        404
      </h1>
      <p className="text-xl mb-8" style={{ color: 'var(--color-text)' }}>
        Page not found
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg font-medium transition-colors"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
      >
        Go Home
      </Link>
    </main>
  );
}
