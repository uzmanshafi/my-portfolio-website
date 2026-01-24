"use client";

import { motion, type Variants } from "motion/react";

/**
 * Container variants for staggered shape appearance.
 * Shapes animate in sequence with slight delay between each.
 */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0,
    },
  },
};

/**
 * Create shape variants with specific target opacity.
 * Shapes scale in from center while fading to their final opacity.
 */
function createShapeVariants(targetOpacity: number): Variants {
  return {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: targetOpacity,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
}

/**
 * Decorative geometric shapes for hero background.
 * Creates layered depth with positioned shapes using CSS.
 * Shapes scale in from center on page load with staggered timing.
 * All shapes are pointer-events-none to not interfere with clicks.
 */
export function GeometricShapes() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Large primary circle - top right with glow */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--color-primary)" }}
        variants={createShapeVariants(0.15)}
      />

      {/* Medium secondary circle - bottom left */}
      <motion.div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-2xl"
        style={{ backgroundColor: "var(--color-secondary)" }}
        variants={createShapeVariants(0.1)}
      />

      {/* Small accent circle - mid right */}
      <motion.div
        className="absolute top-1/3 right-16 w-32 h-32 rounded-full blur-xl"
        style={{ backgroundColor: "var(--color-primary)" }}
        variants={createShapeVariants(0.2)}
      />

      {/* Diagonal line - top left to center */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-px rotate-45"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
        }}
        variants={createShapeVariants(0.2)}
      />

      {/* Diagonal line - bottom right */}
      <motion.div
        className="absolute bottom-32 right-32 w-48 h-px -rotate-12"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
        }}
        variants={createShapeVariants(0.15)}
      />

      {/* Grid pattern section - subtle texture */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
        variants={createShapeVariants(0.03)}
      />

      {/* Scattered small dots */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full"
        style={{ backgroundColor: "var(--color-primary)" }}
        variants={createShapeVariants(0.3)}
      />
      <motion.div
        className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "var(--color-primary)" }}
        variants={createShapeVariants(0.25)}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: "var(--color-secondary)" }}
        variants={createShapeVariants(0.2)}
      />
      <motion.div
        className="absolute top-1/2 left-1/6 w-1 h-1 rounded-full"
        style={{ backgroundColor: "var(--color-primary)" }}
        variants={createShapeVariants(0.35)}
      />

      {/* Accent glow - very subtle purple */}
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--color-accent)" }}
        variants={createShapeVariants(0.08)}
      />
    </motion.div>
  );
}
