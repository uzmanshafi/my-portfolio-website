import type { PublicProject } from "@/lib/data/portfolio";
import { ProjectCard } from "./project-card";

interface ProjectsSectionProps {
  projects: PublicProject[];
}

/**
 * Determine card size class based on index and featured status.
 * Creates asymmetric bento grid pattern for visual interest.
 *
 * Pattern:
 * - Position 0: Large (2x2) - flagship project
 * - Position 1-2: Standard
 * - Position 3: Wide (2x1)
 * - Position 4: Standard
 * - Position 5: Tall (1x2)
 * - Position 6-7: Standard
 * - Then repeat pattern
 */
function getCardSizeClass(index: number, featured: boolean): string {
  // Featured projects always get large treatment if in first position
  if (featured && index < 3) {
    return "lg:col-span-2 lg:row-span-2 aspect-square";
  }

  // Pattern repeats every 8 cards
  const position = index % 8;

  switch (position) {
    case 0:
      return "lg:col-span-2 lg:row-span-2 aspect-square"; // Large
    case 3:
      return "lg:col-span-2 aspect-video"; // Wide
    case 5:
      return "lg:row-span-2 aspect-[3/4]"; // Tall
    default:
      return "aspect-square"; // Standard
  }
}

/**
 * Projects section with asymmetric bento grid layout.
 * Displays portfolio projects with varying card sizes for visual interest.
 */
export function ProjectsSection({ projects }: ProjectsSectionProps) {
  // Empty state
  if (projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h2
          className="text-3xl md:text-4xl font-bold mb-12"
          style={{ color: "var(--color-primary)" }}
        >
          Projects
        </h2>
        <p
          className="text-center py-16 opacity-70"
          style={{ color: "var(--color-text)" }}
        >
          Projects coming soon...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <h2
        className="text-3xl md:text-4xl font-bold mb-12"
        style={{ color: "var(--color-primary)" }}
      >
        Projects
      </h2>

      {/* Bento grid with responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
        {projects.map((project, index) => {
          const sizeClass = getCardSizeClass(index, project.featured);

          return (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              technologies={project.technologies}
              liveUrl={project.liveUrl}
              repoUrl={project.repoUrl}
              featured={project.featured}
              className={sizeClass}
            />
          );
        })}
      </div>
    </div>
  );
}
