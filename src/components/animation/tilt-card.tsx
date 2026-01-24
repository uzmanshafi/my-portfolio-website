"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { snappySpring } from "@/lib/animation/variants";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

/**
 * 3D tilt card effect with shine overlay.
 * Rotates card toward cursor position with subtle shine effect.
 * Disabled on touch devices for better UX.
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
}: TiltCardProps) {
  // Mouse position values (0-1 range, 0.5 is center)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Apply spring physics to rotation for snappy feel
  const rotateX = useSpring(
    useTransform(y, [0, 1], [maxTilt, -maxTilt]),
    snappySpring
  );
  const rotateY = useSpring(
    useTransform(x, [0, 1], [-maxTilt, maxTilt]),
    snappySpring
  );

  // Shine position follows cursor
  const shineX = useTransform(x, [0, 1], [0, 100]);
  const shineY = useTransform(y, [0, 1], [0, 100]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    // Skip tilt effect on touch devices for better UX
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const newX = (event.clientX - rect.left) / rect.width;
    const newY = (event.clientY - rect.top) / rect.height;
    x.set(newX);
    y.set(newY);
  }

  function handleMouseLeave() {
    // Reset to center position
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
      }}
      transition={snappySpring}
    >
      {children}

      {/* Shine overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [shineX, shineY],
            ([xVal, yVal]) =>
              `radial-gradient(circle at ${xVal}% ${yVal}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          ),
        }}
      />
    </motion.div>
  );
}
