"use client";

import { motion } from "motion/react";
import type { PublicProject } from "@/lib/data/portfolio";
import { itemVariants } from "@/lib/animation/variants";
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
 * - Position 1-2: Standard (1x1)
 * - Position 3: Wide (2x1)
 * - Position 4: Standard (1x1)
 * - Position 5: Tall (1x2)
 * - Position 6-7: Standard (1x1)
 * - Then repeat pattern
 *
 * Note: No aspect-* classes - grid auto-rows controls height
 */
function getCardSizeClass(index: number, featured: boolean): string {
  // Featured projects always get large treatment if in first position
  if (featured && index < 3) {
    return "lg:col-span-2 lg:row-span-2";
  }

  // Pattern repeats every 8 cards
  const position = index % 8;

  switch (position) {
    case 0:
      return "lg:col-span-2 lg:row-span-2"; // Large
    case 3:
      return "lg:col-span-2"; // Wide
    case 5:
      return "lg:row-span-2"; // Tall
    default:
      return ""; // Standard - single cell
  }
}

/**
 * Projects section with asymmetric bento grid layout.
 * Displays portfolio projects with varying card sizes for visual interest.
 * Includes scroll-triggered reveal with staggered project cards.
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
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      className="max-w-7xl mx-auto px-6 md:px-8"
    >
      {/* Section heading - reveals first */}
      <motion.h2
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold mb-12"
        style={{ color: "var(--color-primary)" }}
      >
        Projects
      </motion.h2>

      {/* Bento grid with responsive columns and staggered cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[220px] grid-flow-dense">
        {projects.map((project, index) => {
          const sizeClass = getCardSizeClass(index, project.featured);

          return (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className={sizeClass}
            >
              <ProjectCard
                title={project.title}
                description={project.description}
                imageUrl={project.imageUrl}
                technologies={project.technologies}
                liveUrl={project.liveUrl}
                repoUrl={project.repoUrl}
                featured={project.featured}
                className="h-full"
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
