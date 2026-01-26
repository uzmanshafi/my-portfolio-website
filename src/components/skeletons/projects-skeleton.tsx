/**
 * Projects section skeleton matching ProjectsSection bento grid.
 * 6 project cards with asymmetric layout pattern.
 */
export function ProjectsSkeleton() {
  // Bento grid size classes matching projects-section.tsx pattern
  const sizeClasses = [
    "lg:col-span-2 lg:row-span-2", // Position 0: Large
    "",                             // Position 1: Standard
    "",                             // Position 2: Standard
    "lg:col-span-2",               // Position 3: Wide
    "",                             // Position 4: Standard
    "lg:row-span-2",               // Position 5: Tall
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      {/* Section heading - "Projects" */}
      <div className="skeleton h-10 w-28 mb-12 motion-safe:animate-shimmer" />

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[220px] grid-flow-dense">
        {sizeClasses.map((sizeClass, index) => (
          <div
            key={index}
            className={`rounded-xl overflow-hidden glass-card flex flex-col ${sizeClass}`}
          >
            {/* Image area - takes most of the card */}
            <div className="skeleton flex-1 rounded-none motion-safe:animate-shimmer" />

            {/* Card footer with title and tags */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="skeleton h-6 w-32 motion-safe:animate-shimmer" />

              {/* Tech tags */}
              <div className="flex gap-2">
                {[...Array(3)].map((_, tagIndex) => (
                  <div
                    key={tagIndex}
                    className="skeleton h-6 w-14 rounded-full motion-safe:animate-shimmer"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
