"use client";

// Sortable social link item component for drag-and-drop reordering
// Uses @dnd-kit/sortable for drag functionality

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { SocialLink } from "@/generated/prisma/client";

interface SortableSocialLinkProps {
  /** The social link data */
  socialLink: SocialLink;
  /** Called when edit button is clicked */
  onEdit: (socialLink: SocialLink) => void;
  /** Called when delete button is clicked */
  onDelete: (socialLink: SocialLink) => void;
}

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;

/**
 * Get a Lucide icon component by name
 * Falls back to Globe icon if not found
 */
function getIconComponent(iconName: string): LucideIconComponent {
  // Convert to PascalCase (e.g., "github" -> "Github", "external-link" -> "ExternalLink")
  const pascalCase = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  // Get icon from LucideIcons
  const icons = LucideIcons as unknown as Record<string, LucideIconComponent | undefined>;
  return icons[pascalCase] || LucideIcons.Globe;
}

/**
 * Truncate URL for display, keeping protocol and domain visible
 */
function truncateUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}

export function SortableSocialLink({
  socialLink,
  onEdit,
  onDelete,
}: SortableSocialLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: socialLink.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getIconComponent(socialLink.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
      {...attributes}
      role="listitem"
      aria-label={`${socialLink.platform} link`}
      data-dragging={isDragging}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors touch-none"
        style={{ color: "var(--color-text)", opacity: 0.6 }}
        aria-label="Drag to reorder"
        {...listeners}
      >
        <GripVertical size={20} />
      </button>

      {/* Platform Icon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
        style={{ backgroundColor: "rgba(211, 177, 150, 0.15)" }}
      >
        <Icon size={18} style={{ color: "var(--color-primary)" }} />
      </div>

      {/* Platform Name and URL */}
      <div className="flex-1 min-w-0">
        <p
          className="font-medium capitalize"
          style={{ color: "var(--color-text)" }}
        >
          {socialLink.platform}
        </p>
        <p
          className="text-sm truncate"
          style={{ color: "var(--color-text)", opacity: 0.6 }}
          title={socialLink.url}
        >
          {truncateUrl(socialLink.url)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(socialLink)}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          style={{ color: "var(--color-text)" }}
          aria-label={`Edit ${socialLink.platform} link`}
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(socialLink)}
          className="p-2 rounded hover:bg-red-500/20 transition-colors text-red-400"
          aria-label={`Delete ${socialLink.platform} link`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
