/**
 * Hero section skeleton matching HeroSection layout.
 * Prevents CLS by mirroring exact dimensions.
 */
export function HeroSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-8">
      <div className="max-w-4xl text-center w-full">
        {/* Name placeholder - h1 text-4xl to text-7xl */}
        <div className="skeleton h-12 sm:h-14 md:h-16 lg:h-20 w-3/4 mx-auto mb-4 motion-safe:animate-shimmer" />

        {/* Title placeholder - h2 text-xl to text-3xl */}
        <div className="skeleton h-8 sm:h-9 md:h-10 w-1/2 mx-auto mb-6 motion-safe:animate-shimmer" />

        {/* Headline - 2 lines */}
        <div className="max-w-2xl mx-auto space-y-3 mb-4">
          <div className="skeleton h-6 md:h-7 w-full motion-safe:animate-shimmer" />
          <div className="skeleton h-6 md:h-7 w-3/4 mx-auto motion-safe:animate-shimmer" />
        </div>

        {/* Location placeholder */}
        <div className="skeleton h-5 w-32 mx-auto mb-8 md:mb-12 motion-safe:animate-shimmer" />

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-12">
          <div className="skeleton h-12 md:h-14 w-36 md:w-40 rounded-lg motion-safe:animate-shimmer" />
          <div className="skeleton h-12 md:h-14 w-40 md:w-48 rounded-lg motion-safe:animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
