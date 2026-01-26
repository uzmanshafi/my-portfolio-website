/**
 * Section navigation skeleton matching SectionNav layout.
 * Fixed positioning on desktop, hidden on mobile.
 */
export function SectionNavSkeleton() {
  return (
    <div
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4"
      aria-hidden="true"
    >
      {/* 5 navigation dots */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="skeleton w-3 h-3 rounded-full motion-safe:animate-shimmer"
        />
      ))}
    </div>
  );
}
