"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { revealVariants, viewportConfig } from "@/lib/animation/variants";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Scroll-triggered reveal wrapper component.
 * Fades and slides content up when it enters the viewport.
 * Respects prefers-reduced-motion via MotionProvider.
 */
export function AnimatedSection({
  children,
  className,
  delay,
}: AnimatedSectionProps) {
  const variants = delay
    ? {
        hidden: revealVariants.hidden,
        visible: {
          ...revealVariants.visible,
          transition: {
            ...((revealVariants.visible as { transition: object }).transition),
            delay,
          },
        },
      }
    : revealVariants;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
