/**
 * About section skeleton matching AboutSection layout.
 * Two-column grid with profile image and bio text.
 */
export function AboutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Profile Image Column */}
        <div className="flex justify-center lg:justify-start">
          <div className="skeleton w-full max-w-xs lg:max-w-md aspect-square rounded-3xl motion-safe:animate-shimmer" />
        </div>

        {/* Text Content Column */}
        <div>
          {/* Section Heading - "About Me" */}
          <div className="skeleton h-10 w-36 mb-6 motion-safe:animate-shimmer" />

          {/* Bio paragraphs */}
          <div className="space-y-4 max-w-prose">
            {/* Paragraph 1 - 3 lines */}
            <div className="space-y-2">
              <div className="skeleton h-5 w-full motion-safe:animate-shimmer" />
              <div className="skeleton h-5 w-full motion-safe:animate-shimmer" />
              <div className="skeleton h-5 w-4/5 motion-safe:animate-shimmer" />
            </div>
            {/* Paragraph 2 - 2 lines */}
            <div className="space-y-2">
              <div className="skeleton h-5 w-full motion-safe:animate-shimmer" />
              <div className="skeleton h-5 w-2/3 motion-safe:animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
