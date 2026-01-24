"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Global motion configuration provider.
 * Wraps children with MotionConfig to respect system prefers-reduced-motion setting.
 * reducedMotion="user" means animations are disabled when user has set prefer-reduced-motion.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
