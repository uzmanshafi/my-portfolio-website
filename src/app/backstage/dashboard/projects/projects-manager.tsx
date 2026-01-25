"use client";

// Client component for projects CRUD and drag-and-drop reordering
// Uses @dnd-kit for drag-and-drop functionality

import { useState, useOptimistic, startTransition, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/generated/prisma/client";
import { SortableProjectItem } from "@/components/admin/sortable-project-item";
import { ProjectFormModal } from "@/components/admin/project-form-modal";
import {
  deleteProject,
  updateProjectsOrder,
  toggleProjectVisibility,
} from "@/lib/actions/projects";

interface ProjectsManagerProps {
  initialProjects: Project[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  // State for projects
  const [projects, setProjects] = useState(initialProjects);
  const [optimisticProjects, setOptimisticProjects] = useOptimistic(projects);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Delete confirmation state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = optimisticProjects.findIndex((p) => p.id === active.id);
      const newIndex = optimisticProjects.findIndex((p) => p.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Optimistic update
      const newOrder = arrayMove(optimisticProjects, oldIndex, newIndex);
      startTransition(() => {
        setOptimisticProjects(newOrder);
      });

      // Prepare order updates
      const updates = newOrder.map((project, index) => ({
        id: project.id,
        order: index,
      }));

      // Save to server
      const result = await updateProjectsOrder(updates);

      if (result.success) {
        setProjects(newOrder);
        toast.success("Order saved - now live");
      } else {
        // Revert optimistic update on error
        startTransition(() => {
          setOptimisticProjects(projects);
        });
        toast.error(result.error || "Failed to update order");
      }
    },
    [optimisticProjects, projects, setOptimisticProjects]
  );

  // Handle add project
  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  // Handle delete project - show confirmation
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    const result = await deleteProject(projectToDelete.id);

    if (result.success) {
      // Remove from state
      const newProjects = projects.filter((p) => p.id !== projectToDelete.id);
      setProjects(newProjects);
      startTransition(() => {
        setOptimisticProjects(newProjects);
      });
      toast.success("Project removed from site");
    } else {
      toast.error(result.error || "Failed to delete project");
    }

    setIsDeleting(false);
    setProjectToDelete(null);
  };

  // Handle visibility toggle
  const handleToggleVisibility = async (project: Project) => {
    // Optimistic update
    const newProjects = optimisticProjects.map((p) =>
      p.id === project.id ? { ...p, visible: !p.visible } : p
    );
    startTransition(() => {
      setOptimisticProjects(newProjects);
    });

    const result = await toggleProjectVisibility(project.id);

    if (result.success) {
      setProjects(newProjects);
      toast.success(result.data?.visible ? "Project visible - now live" : "Project hidden from site");
    } else {
      // Revert on error
      startTransition(() => {
        setOptimisticProjects(projects);
      });
      toast.error(result.error || "Failed to toggle visibility");
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  return (
    <>
      {/* Add button */}
      <div className="mb-6">
        <button
          onClick={handleAddProject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Projects list */}
      {optimisticProjects.length === 0 ? (
        // Empty state
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.05)",
            border: "1px solid rgba(243, 233, 226, 0.1)",
          }}
        >
          <FolderKanban
            size={48}
            style={{ color: "var(--color-text)", opacity: 0.2 }}
            className="mx-auto mb-4"
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            No projects yet
          </h3>
          <p
            className="mb-4"
            style={{ color: "var(--color-text)", opacity: 0.6 }}
          >
            Add your first project to showcase on your portfolio.
          </p>
          <button
            onClick={handleAddProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            <Plus size={18} />
            Add Project
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={optimisticProjects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className="space-y-3 rounded-xl p-4"
              style={{
                backgroundColor: "rgba(243, 233, 226, 0.03)",
                border: "1px solid rgba(243, 233, 226, 0.1)",
              }}
            >
              {optimisticProjects.map((project) => (
                <SortableProjectItem
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Project form modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSuccess={handleModalSuccess}
      />

      {/* Delete confirmation modal */}
      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !isDeleting && setProjectToDelete(null)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md p-6 rounded-lg shadow-xl"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Delete Project
            </h2>
            <p
              className="mb-6"
              style={{ color: "var(--color-text)", opacity: 0.8 }}
            >
              Are you sure you want to delete &quot;{projectToDelete.title}&quot;?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                  border: "1px solid rgba(243, 233, 226, 0.3)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-text)",
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
