import * as icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SocialLinkButtonProps {
  platform: string;
  url: string;
  icon: string; // Lucide icon name stored in DB (lowercase, e.g., "github", "linkedin")
}

/**
 * Convert lowercase icon name to PascalCase for Lucide lookup.
 * Examples: "github" -> "Github", "linkedin" -> "Linkedin"
 */
function getIconComponent(iconName: string): LucideIcon {
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconComponent = (icons as unknown as Record<string, LucideIcon>)[pascalCase];
  return IconComponent || icons.Link; // Fallback to Link icon
}

/**
 * Social link button with dynamic Lucide icon.
 * Opens link in new tab with proper security attributes.
 */
export function SocialLinkButton({ platform, url, icon }: SocialLinkButtonProps) {
  const IconComponent = getIconComponent(icon);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center p-4 rounded-lg transition-all duration-200 hover:scale-110 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"
      aria-label={`Visit ${platform}`}
      title={platform}
    >
      <IconComponent
        className="w-6 h-6"
        style={{ color: "var(--color-text)" }}
      />
    </a>
  );
}
