"use client";

// Sortable project card for drag-and-drop reordering
// Uses @dnd-kit/sortable for drag functionality

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
} from "lucide-react";
import type { Project } from "@/generated/prisma/client";
import Image from "next/image";

interface SortableProjectItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleVisibility: (project: Project) => void;
}

export function SortableProjectItem({
  project,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 rounded-lg border transition-all
        ${isDragging ? "opacity-50 shadow-lg z-10" : ""}
        ${!project.visible ? "opacity-60" : ""}
      `}
      {...attributes}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing touch-none"
        style={{ color: "var(--color-text)", opacity: 0.5 }}
        aria-label="Drag to reorder"
      >
        <GripVertical size={20} />
      </button>

      {/* Project thumbnail */}
      <div
        className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "rgba(243, 233, 226, 0.1)" }}
      >
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs"
            style={{ color: "var(--color-text)", opacity: 0.3 }}
          >
            No image
          </div>
        )}
      </div>

      {/* Project info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`font-medium truncate ${!project.visible ? "line-through" : ""}`}
            style={{ color: "var(--color-text)" }}
          >
            {project.title}
          </h3>
          {project.featured && (
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: "rgba(211, 177, 150, 0.2)",
                color: "var(--color-primary)",
              }}
            >
              Featured
            </span>
          )}
          {!project.visible && (
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: "rgba(243, 233, 226, 0.1)",
                color: "var(--color-text)",
                opacity: 0.6,
              }}
            >
              Hidden
            </span>
          )}
        </div>
        <p
          className="text-sm truncate mt-1"
          style={{ color: "var(--color-text)", opacity: 0.6 }}
        >
          {project.description}
        </p>
        {/* Links */}
        <div className="flex items-center gap-3 mt-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:opacity-80"
              style={{ color: "var(--color-primary)" }}
            >
              <ExternalLink size={12} />
              Live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:opacity-80"
              style={{ color: "var(--color-primary)" }}
            >
              <Github size={12} />
              Repo
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Visibility toggle */}
        <button
          onClick={() => onToggleVisibility(project)}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--color-text)" }}
          aria-label={project.visible ? "Hide project" : "Show project"}
          title={project.visible ? "Hide project" : "Show project"}
        >
          {project.visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        {/* Edit button */}
        <button
          onClick={() => onEdit(project)}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--color-text)" }}
          aria-label="Edit project"
          title="Edit project"
        >
          <Pencil size={18} />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(project)}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--color-accent)" }}
          aria-label="Delete project"
          title="Delete project"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
