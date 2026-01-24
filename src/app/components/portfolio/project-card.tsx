"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string | null;
  imageUrl: string | null;
  technologies: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  className?: string;
}

/**
 * Individual project card with hover-revealed action links.
 * Displays image, title, tech tags with smooth hover transitions.
 */
export function ProjectCard({
  title,
  description,
  imageUrl,
  technologies,
  liveUrl,
  repoUrl,
  featured,
  className = "",
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine the primary link for card click
  const primaryLink = liveUrl || repoUrl;

  return (
    <article
      className={`group relative overflow-hidden rounded-xl ${className} ${
        featured
          ? "ring-2 ring-[var(--color-accent)] ring-opacity-50 shadow-lg shadow-[var(--color-accent)]/20"
          : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image or gradient placeholder */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={`object-cover transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
            }}
          />
        )}
      </div>

      {/* Overlay gradient for text readability */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          isHovered ? "opacity-90" : "opacity-100"
        }`}
      />

      {/* Content positioned at bottom with glassmorphism */}
      <div className="relative h-full flex flex-col justify-end p-4 md:p-6">
        {/* Glass panel for content area - bold frosted glass effect */}
        <div className="glass-card-strong grain rounded-lg p-4 z-10">
          {/* Title and tech tags - always visible */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-[var(--color-text)]">
              {title}
            </h3>

            {/* Technology tags */}
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {technologies.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 rounded-full bg-white/20 text-[var(--color-text)]"
                  >
                    {tech}
                  </span>
                ))}
                {technologies.length > 5 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-[var(--color-text)]/70">
                    +{technologies.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action links - revealed on hover */}
          <div
            className={`flex gap-3 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 text-[var(--color-text)] transition-colors"
                aria-label={`View live demo of ${title}`}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 text-[var(--color-text)] transition-colors"
                aria-label={`View GitHub repository for ${title}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Make card clickable to primary link */}
      {primaryLink && (
        <a
          href={primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          aria-label={`Open ${title}`}
        >
          <span className="sr-only">View {title}</span>
        </a>
      )}
    </article>
  );
}
