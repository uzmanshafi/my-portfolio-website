"use client";

import * as lucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DEVICON_MAP } from "@/lib/icons/devicon-registry";
import { CATEGORY_FALLBACKS } from "@/lib/icons/icon-categories";
import type { SkillCategory } from "@/lib/validations/skill";

interface TechIconProps {
  iconType: "devicon" | "lucide";
  iconId: string;
  size?: number;
  className?: string;
  /**
   * Fallback category for when devicon is not found.
   * Used to show category-appropriate Lucide icon.
   */
  fallbackCategory?: SkillCategory;
}

/**
 * Convert lowercase icon name to PascalCase for Lucide lookup.
 * Examples: "file-code" -> "FileCode", "database" -> "Database"
 */
function getLucideIconComponent(iconName: string): LucideIcon {
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconComponent = (lucideIcons as unknown as Record<string, LucideIcon>)[pascalCase];
  return IconComponent || lucideIcons.Code; // Fallback to Code icon
}

/**
 * Unified icon component for rendering tech icons.
 * Supports both devicon (tech logos) and lucide (UI icons) systems.
 *
 * Usage:
 * - iconType="devicon" + iconId="react" renders React logo
 * - iconType="lucide" + iconId="code" renders Lucide Code icon
 *
 * Falls back to category-based Lucide icon if devicon not found.
 * Uses currentColor for monochrome design system integration.
 */
export function TechIcon({
  iconType,
  iconId,
  size = 20,
  className = "",
  fallbackCategory = "frontend",
}: TechIconProps) {
  // Try to render devicon
  if (iconType === "devicon") {
    const deviconEntry = DEVICON_MAP.get(iconId);
    if (deviconEntry) {
      const DeviconComponent = deviconEntry.component;
      return (
        <DeviconComponent
          color="currentColor"
          className={className}
          style={{
            width: size,
            height: size,
            flexShrink: 0,
          }}
        />
      );
    }

    // Devicon not found, fall back to category Lucide icon
    const FallbackIcon = CATEGORY_FALLBACKS[fallbackCategory];
    return (
      <FallbackIcon
        className={className}
        style={{
          width: size,
          height: size,
          flexShrink: 0,
        }}
      />
    );
  }

  // Render Lucide icon
  const LucideIconComponent = getLucideIconComponent(iconId);
  return (
    <LucideIconComponent
      className={className}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
      }}
    />
  );
}
