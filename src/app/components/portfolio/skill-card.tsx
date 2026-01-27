import * as lucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DEVICON_MAP } from "@/lib/icons/devicon-registry";

interface SkillCardProps {
  name: string;
  iconType: string; // "devicon" | "lucide"
  iconId: string;   // devicon id (e.g., "react") or lucide icon name (e.g., "code")
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
 * Individual skill card displaying icon and name.
 * Supports both devicon (tech logos) and lucide (UI icons) icon types.
 * Compact design for use in skills grid.
 */
export function SkillCard({ name, iconType, iconId }: SkillCardProps) {
  // Render devicon or lucide icon based on iconType
  const renderIcon = () => {
    if (iconType === "devicon") {
      const deviconEntry = DEVICON_MAP.get(iconId);
      if (deviconEntry) {
        const DeviconComponent = deviconEntry.component;
        return (
          <DeviconComponent
            color="currentColor"
            style={{
              width: 20,
              height: 20,
              color: "var(--color-primary)",
              flexShrink: 0,
            }}
          />
        );
      }
    }

    // Fallback to lucide icon
    const LucideIconComponent = getLucideIconComponent(iconId);
    return (
      <LucideIconComponent
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "var(--color-primary)" }}
      />
    );
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg glass-card grain"
    >
      {renderIcon()}
      <span className="text-sm" style={{ color: "var(--color-text)" }}>
        {name}
      </span>
    </div>
  );
}
