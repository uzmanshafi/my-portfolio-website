import type { Transition, Variants } from "motion/react";

/**
 * Reveal variants for scroll-triggered animations
 * Used with whileInView trigger
 */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/**
 * Container variant for staggered children animations
 * Wrap children with this parent for automatic stagger
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0,
    },
  },
};

/**
 * Individual item variants for staggered animations
 * Use as child of staggerContainer
 */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/**
 * Snappy spring config with no overshoot
 * Use for interactive elements (hover, tilt, etc.)
 */
export const snappySpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/**
 * Standard viewport settings for whileInView animations
 * once: true - only animate on first intersection
 * amount: 0.5 - trigger when 50% visible
 */
export const viewportConfig = {
  once: true,
  amount: 0.5,
} as const;
