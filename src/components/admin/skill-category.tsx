"use client";

// Category container with sortable skills list
// Uses dnd-kit SortableContext for drag-and-drop reordering within category

import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Skill } from "@/generated/prisma/client";
import { SortableSkillItem } from "./sortable-skill-item";
import { SKILL_CATEGORIES } from "@/lib/validations/skill";

interface SkillCategoryProps {
  category: string;
  skills: Skill[];
  onEditSkill: (skill: Skill) => void;
  onDeleteSkill: (skill: Skill) => void;
  /** Whether this category itself is draggable (for category reordering) */
  isDraggableCategory?: boolean;
}

export function SkillCategory({
  category,
  skills,
  onEditSkill,
  onDeleteSkill,
  isDraggableCategory = false,
}: SkillCategoryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get display label for category
  const categoryLabel =
    SKILL_CATEGORIES.find((c) => c.value === category)?.label || category;

  // Sortable attributes for category-level dragging
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `category-${category}`,
    disabled: !isDraggableCategory,
  });

  const style = isDraggableCategory
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  // Get skill IDs for sortable context
  const skillIds = skills.map((s) => s.id);

  return (
    <div
      ref={isDraggableCategory ? setNodeRef : undefined}
      style={style}
      className="rounded-xl overflow-hidden"
      {...(isDraggableCategory ? attributes : {})}
      data-category={category}
    >
      {/* Category header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: "rgba(211, 177, 150, 0.1)",
          borderBottom: isCollapsed ? "none" : "1px solid rgba(243, 233, 226, 0.1)",
        }}
      >
        {/* Category drag handle (only if category is draggable) */}
        {isDraggableCategory && (
          <button
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors touch-none"
            style={{ color: "rgba(243, 233, 226, 0.5)" }}
            aria-label={`Drag to reorder ${categoryLabel} category`}
          >
            <GripVertical size={18} />
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: "rgba(243, 233, 226, 0.5)" }}
          aria-label={isCollapsed ? "Expand category" : "Collapse category"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Category label */}
        <h3
          className="flex-1 font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {categoryLabel}
        </h3>

        {/* Skill count */}
        <span
          className="text-sm px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.1)",
            color: "rgba(243, 233, 226, 0.6)",
          }}
        >
          {skills.length}
        </span>
      </div>

      {/* Skills list (collapsible) */}
      {!isCollapsed && (
        <div
          className="p-2 space-y-2"
          style={{ backgroundColor: "rgba(243, 233, 226, 0.02)" }}
        >
          {skills.length === 0 ? (
            <p
              className="text-center py-4 text-sm"
              style={{ color: "rgba(243, 233, 226, 0.4)" }}
            >
              No skills in this category
            </p>
          ) : (
            <SortableContext items={skillIds} strategy={verticalListSortingStrategy}>
              {skills.map((skill) => (
                <SortableSkillItem
                  key={skill.id}
                  skill={skill}
                  onEdit={onEditSkill}
                  onDelete={onDeleteSkill}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
}
