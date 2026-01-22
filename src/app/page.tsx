export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        Portfolio Foundation
      </h1>
      <p className="text-xl mb-8" style={{ color: 'var(--color-text)' }}>
        Next.js 15 + Tailwind CSS 4 + PostgreSQL
      </p>
      <div className="flex gap-4">
        <div
          className="w-24 h-24 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--color-background)' }}>Primary</span>
        </div>
        <div
          className="w-24 h-24 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--color-text)' }}>Secondary</span>
        </div>
        <div
          className="w-24 h-24 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--color-text)' }}>Accent</span>
        </div>
      </div>
    </main>
  );
}
