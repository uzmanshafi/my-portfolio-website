"use client";

import { motion } from "motion/react";
import type { ElementType, ComponentPropsWithoutRef, CSSProperties } from "react";

interface AnimatedTextProps<T extends ElementType = "span"> {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: T;
  staggerDelay?: number;
  delay?: number;
}

/**
 * Word-by-word text reveal animation.
 * Splits text into words and animates each one with stagger effect.
 * Supports delay prop for choreographed sequences.
 */
export function AnimatedText<T extends ElementType = "span">({
  text,
  className,
  style,
  as,
  staggerDelay = 0.08,
  delay = 0,
}: AnimatedTextProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof AnimatedTextProps<T>>) {
  const Component = as || "span";
  const MotionComponent = motion.create(Component);
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
      style={style}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
