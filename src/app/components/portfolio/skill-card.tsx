import * as icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SkillCardProps {
  name: string;
  icon: string; // Lucide icon name stored in DB (lowercase, e.g., "code", "database")
}

/**
 * Convert lowercase icon name to PascalCase for Lucide lookup.
 * Examples: "file-code" -> "FileCode", "database" -> "Database"
 */
function getIconComponent(iconName: string): LucideIcon {
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconComponent = (icons as unknown as Record<string, LucideIcon>)[pascalCase];
  return IconComponent || icons.Code; // Fallback to Code icon
}

/**
 * Individual skill card displaying icon and name.
 * Compact design for use in skills grid.
 */
export function SkillCard({ name, icon }: SkillCardProps) {
  const IconComponent = getIconComponent(icon);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <IconComponent
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "var(--color-primary)" }}
      />
      <span className="text-sm" style={{ color: "var(--color-text)" }}>
        {name}
      </span>
    </div>
  );
}
