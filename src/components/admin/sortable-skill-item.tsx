"use client";

// Draggable skill item component using dnd-kit
// Displays skill with drag handle, icon, name, and edit/delete actions

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Circle, LucideIcon } from "lucide-react";
import type { Skill } from "@/generated/prisma/client";
import * as LucideIcons from "lucide-react";
import { DEVICON_MAP } from "@/lib/icons/devicon-registry";

interface SortableSkillItemProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
}

// Helper to render dynamic icon (devicon or lucide)
function DynamicIcon({
  iconType,
  iconId,
  className,
}: {
  iconType: string;
  iconId: string;
  className?: string;
}) {
  // Render devicon if type is devicon
  if (iconType === "devicon") {
    const deviconEntry = DEVICON_MAP.get(iconId);
    if (deviconEntry) {
      const DeviconComponent = deviconEntry.component;
      return (
        <DeviconComponent
          color="currentColor"
          style={{ width: 16, height: 16 }}
          className={className}
        />
      );
    }
  }

  // Fallback to Lucide icon
  const pascalCase = iconId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const IconComponent = icons[pascalCase] || Circle;

  return <IconComponent className={className} />;
}

export function SortableSkillItem({
  skill,
  onEdit,
  onDelete,
}: SortableSkillItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging
      ? "rgba(211, 177, 150, 0.1)"
      : "rgba(243, 233, 226, 0.05)",
    border: "1px solid rgba(243, 233, 226, 0.1)",
    boxShadow: isDragging ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-shadow"
      {...attributes}
      data-dragging={isDragging}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors touch-none"
        style={{ color: "rgba(243, 233, 226, 0.5)" }}
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      {/* Skill icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "rgba(211, 177, 150, 0.15)" }}
      >
        <DynamicIcon
          iconType={skill.iconType}
          iconId={skill.iconId}
          className="w-4 h-4"
        />
      </div>

      {/* Skill name */}
      <span
        className="flex-1 font-medium"
        style={{ color: "var(--color-text)" }}
      >
        {skill.name}
      </span>

      {/* Edit button */}
      <button
        onClick={() => onEdit(skill)}
        className="p-2 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: "rgba(243, 233, 226, 0.6)" }}
        aria-label={`Edit ${skill.name}`}
      >
        <Pencil size={16} />
      </button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(skill)}
        className="p-2 rounded-lg transition-colors hover:bg-red-500/20 hover:text-red-400"
        style={{ color: "rgba(243, 233, 226, 0.6)" }}
        aria-label={`Delete ${skill.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
