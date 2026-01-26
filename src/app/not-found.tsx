import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      <FileQuestion
        size={48}
        className="mb-6"
        style={{ color: 'var(--color-primary)', opacity: 0.6 }}
      />
      <h1
        className="text-4xl font-bold mb-2"
        style={{ color: 'var(--color-primary)' }}
      >
        404
      </h1>
      <p
        className="text-xl mb-8 text-center"
        style={{ color: 'var(--color-text)', opacity: 0.7 }}
      >
        Page not found
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
      >
        Go Home
      </Link>
    </main>
  );
}
