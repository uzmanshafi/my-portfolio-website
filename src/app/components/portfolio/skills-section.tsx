"use client";

import { motion } from "motion/react";
import type { GroupedSkills } from "@/lib/data/portfolio";
import { itemVariants } from "@/lib/animation/variants";
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
 * Includes scroll-triggered reveal with cascading skill cards by category.
 */
export function SkillsSection({ skills }: SkillsSectionProps) {
  // Don't render if no skills
  if (skills.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-6xl mx-auto px-6 md:px-8"
    >
      {/* Section heading - reveals first */}
      <motion.h2
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold mb-12"
        style={{ color: "var(--color-primary)" }}
      >
        Skills
      </motion.h2>

      <div className="space-y-10">
        {skills.map(({ category, skills: categorySkills }) => (
          <motion.div
            key={category}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {/* Category heading */}
            <motion.h3
              variants={itemVariants}
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              {capitalizeCategory(category)}
            </motion.h3>

            {/* Skills grid - responsive columns with cascading skill cards */}
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            >
              {categorySkills.map((skill) => (
                <motion.div key={skill.id} variants={itemVariants}>
                  <SkillCard name={skill.name} icon={skill.icon} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
