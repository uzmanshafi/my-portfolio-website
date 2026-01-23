import type { GroupedSkills } from "@/lib/data/portfolio";
import { SkillCard } from "./skill-card";

interface SkillsSectionProps {
  skills: GroupedSkills;
}

/**
 * Capitalize category name for display.
 * Examples: "frontend" -> "Frontend", "backend" -> "Backend"
 */
function capitalizeCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Skills section displaying technical competencies organized by category.
 * Shows skills in a responsive grid layout with Lucide icons.
 */
export function SkillsSection({ skills }: SkillsSectionProps) {
  // Don't render if no skills
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      <h2
        className="text-3xl md:text-4xl font-bold mb-12"
        style={{ color: "var(--color-primary)" }}
      >
        Skills
      </h2>

      <div className="space-y-10">
        {skills.map(({ category, skills: categorySkills }) => (
          <div key={category}>
            {/* Category heading */}
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              {capitalizeCategory(category)}
            </h3>

            {/* Skills grid - responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categorySkills.map((skill) => (
                <SkillCard key={skill.id} name={skill.name} icon={skill.icon} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
