"use client";

import { motion, type Variants } from "motion/react";
import { AnimatedText } from "@/components/animation/animated-text";

interface HeroSectionProps {
  name: string;
  title: string;
  headline: string;
  location: string | null;
  resumeUrl: string | null;
}

/**
 * Fade-in variants for elements that appear after text reveal.
 */
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/**
 * Hero section component displaying bio information and CTAs.
 * Features choreographed entrance animations:
 * 1. Geometric shapes animate first (handled by GeometricShapes component)
 * 2. Name reveals word-by-word (delay: 0.5s after page load)
 * 3. Title reveals word-by-word (delay: 0.7s)
 * 4. Headline reveals word-by-word (delay: 0.9s)
 * 5. Location and CTAs fade in (delay: 1.2s)
 */
export function HeroSection({
  name,
  title,
  headline,
  location,
  resumeUrl,
}: HeroSectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-8">
      <div className="max-w-4xl text-center">
        {/* Name - Primary heading with word-by-word reveal */}
        <AnimatedText
          text={name}
          as="h1"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
          delay={0.5}
        />

        {/* Title/Role - Secondary heading with word-by-word reveal */}
        <AnimatedText
          text={title}
          as="h2"
          className="text-xl sm:text-2xl md:text-3xl font-medium mb-6"
          style={{ color: "var(--color-primary)" }}
          delay={0.7}
        />

        {/* Headline/Tagline - Body text with word-by-word reveal */}
        <AnimatedText
          text={headline}
          as="p"
          className="text-lg md:text-xl max-w-2xl mx-auto opacity-80"
          style={{ color: "var(--color-text)" }}
          delay={0.9}
        />

        {/* Location and CTAs fade in after text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          transition={{ delay: 1.2 }}
        >
          {/* Location - below tagline */}
          {location && (
            <p
              className="text-base md:text-lg mt-4 mb-8 md:mb-12 opacity-60"
              style={{ color: "var(--color-text)" }}
            >
              {location}
            </p>
          )}

          {!location && <div className="mb-8 md:mb-12" />}

          {/* CTAs container */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-12">
            {/* View Projects - Primary CTA */}
            <a
              href="#projects"
              className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
              aria-label="View my projects"
            >
              View Projects
            </a>

            {/* Download Resume - Secondary CTA (conditional) */}
            {resumeUrl && (
              <a
                href={resumeUrl}
                download
                className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium border-2 transition-all duration-200 hover:scale-105 bg-transparent hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-[var(--color-background)] border-[var(--color-primary)]"
                aria-label="Download my resume"
              >
                Download Resume
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
