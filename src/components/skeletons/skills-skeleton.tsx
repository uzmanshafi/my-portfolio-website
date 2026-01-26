/**
 * Skills section skeleton matching SkillsSection layout.
 * 3 category groups with 5 skill cards each.
 */
export function SkillsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      {/* Section heading - "Skills" */}
      <div className="skeleton h-10 w-24 mb-12 motion-safe:animate-shimmer" />

      <div className="space-y-10">
        {/* 3 category groups */}
        {[...Array(3)].map((_, categoryIndex) => (
          <div key={categoryIndex}>
            {/* Category heading */}
            <div className="skeleton h-7 w-28 mb-4 motion-safe:animate-shimmer" />

            {/* Skills grid - 5 skills per category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, skillIndex) => (
                <div
                  key={skillIndex}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg glass-card"
                >
                  {/* Icon circle */}
                  <div className="skeleton w-5 h-5 rounded-full flex-shrink-0 motion-safe:animate-shimmer" />
                  {/* Skill name */}
                  <div className="skeleton h-4 w-16 motion-safe:animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
