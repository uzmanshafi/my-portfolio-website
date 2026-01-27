"use client";

// Skills manager client component
// Handles CRUD operations and drag-and-drop reordering

import { useState, useOptimistic, startTransition, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/generated/prisma/client";
import type { GroupedSkills } from "@/lib/actions/skills";
import {
  createSkill,
  updateSkill,
  deleteSkill,
  updateSkillsOrder,
  updateCategoryOrder,
} from "@/lib/actions/skills";
import { SKILL_CATEGORIES } from "@/lib/validations/skill";
import { SkillCategory as SkillCategoryComponent } from "@/components/admin/skill-category";
import { IconPickerModal } from "@/components/admin/icon-picker/icon-picker-modal";
import { TechIcon } from "@/components/ui/tech-icon";
import { findMatchingIcon } from "@/lib/icons/icon-matcher";
import { DEVICON_MAP } from "@/lib/icons/devicon-registry";

interface SkillsManagerProps {
  initialSkills: GroupedSkills;
}

// Type for modal state
type ModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; skill: Skill }
  | { type: "delete"; skill: Skill };

export function SkillsManager({ initialSkills }: SkillsManagerProps) {
  // State for grouped skills with optimistic updates
  const [groupedSkills, setGroupedSkills] = useState<GroupedSkills>(initialSkills);

  // Optimistic state for drag operations
  const [optimisticSkills, setOptimisticSkills] = useOptimistic(
    groupedSkills,
    (state, newSkills: GroupedSkills) => newSkills
  );

  // Modal state
  const [modal, setModal] = useState<ModalState>({ type: "closed" });

  // Form loading state
  const [isLoading, setIsLoading] = useState(false);

  // Active drag item for overlay
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Get all category IDs for sortable context
  const categoryIds = optimisticSkills.map((g) => `category-${g.category}`);

  // Handle drag start
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;

    // Check if dragging a category
    if (activeId.startsWith("category-")) {
      setActiveCategory(activeId.replace("category-", ""));
      return;
    }

    // Find the skill being dragged
    for (const group of optimisticSkills) {
      const skill = group.skills.find((s) => s.id === activeId);
      if (skill) {
        setActiveSkill(skill);
        break;
      }
    }
  }

  // Handle drag end
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveSkill(null);
    setActiveCategory(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle category reordering
    if (activeId.startsWith("category-") && overId.startsWith("category-")) {
      const oldCategory = activeId.replace("category-", "");
      const newCategory = overId.replace("category-", "");

      const oldIndex = optimisticSkills.findIndex((g) => g.category === oldCategory);
      const newIndex = optimisticSkills.findIndex((g) => g.category === newCategory);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newGrouped = arrayMove(optimisticSkills, oldIndex, newIndex);
        const newCategoryOrder = newGrouped.map((g) => g.category);

        // Optimistic update
        startTransition(() => {
          setOptimisticSkills(newGrouped);
        });
        setGroupedSkills(newGrouped);

        // Persist to database
        const result = await updateCategoryOrder(newCategoryOrder);
        if (!result.success) {
          // Revert on error
          setGroupedSkills(optimisticSkills);
          toast.error(result.error || "Failed to reorder categories");
        } else {
          toast.success("Categories reordered - now live");
        }
      }
      return;
    }

    // Handle skill reordering within same category
    // Find which category contains the active skill
    let sourceGroup: GroupedSkills[number] | undefined;
    let sourceSkillIndex = -1;

    for (const group of optimisticSkills) {
      const idx = group.skills.findIndex((s) => s.id === activeId);
      if (idx !== -1) {
        sourceGroup = group;
        sourceSkillIndex = idx;
        break;
      }
    }

    if (!sourceGroup) return;

    // Find target position
    let targetIndex = -1;
    for (let i = 0; i < sourceGroup.skills.length; i++) {
      if (sourceGroup.skills[i].id === overId) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) return;

    // Reorder skills within category
    const newSkills = arrayMove(sourceGroup.skills, sourceSkillIndex, targetIndex);
    const updates = newSkills.map((skill, idx) => ({
      id: skill.id,
      order: idx,
    }));

    // Optimistic update
    const newGrouped = optimisticSkills.map((g) =>
      g.category === sourceGroup!.category ? { ...g, skills: newSkills } : g
    );

    startTransition(() => {
      setOptimisticSkills(newGrouped);
    });
    setGroupedSkills(newGrouped);

    // Persist to database
    const result = await updateSkillsOrder(updates);
    if (!result.success) {
      // Revert on error
      setGroupedSkills(optimisticSkills);
      toast.error(result.error || "Failed to reorder skills");
    } else {
      toast.success("Skills reordered - now live");
    }
  }

  // Handle add skill form submit
  async function handleAddSkill(formData: FormData) {
    setIsLoading(true);

    const result = await createSkill(formData);

    if (result.success && result.data) {
      const newSkill = result.data;
      // Add skill to appropriate category
      const newGrouped = optimisticSkills.map((g) =>
        g.category === newSkill.category
          ? { ...g, skills: [...g.skills, newSkill] }
          : g
      );
      setGroupedSkills(newGrouped);
      setModal({ type: "closed" });
      toast.success(`"${newSkill.name}" added - now live`);
    } else {
      toast.error(result.error || "Failed to add skill");
    }

    setIsLoading(false);
  }

  // Handle edit skill form submit
  async function handleEditSkill(skill: Skill, formData: FormData) {
    setIsLoading(true);

    const result = await updateSkill(skill.id, formData);

    if (result.success && result.data) {
      const updatedSkill = result.data;
      // Update skill in state
      const newGrouped = optimisticSkills.map((g) => ({
        ...g,
        skills:
          g.category === skill.category
            ? g.skills.map((s) => (s.id === skill.id ? updatedSkill : s))
            : g.category === updatedSkill.category
            ? [...g.skills.filter((s) => s.id !== skill.id), updatedSkill]
            : g.skills.filter((s) => s.id !== skill.id),
      }));
      setGroupedSkills(newGrouped);
      setModal({ type: "closed" });
      toast.success(`"${updatedSkill.name}" updated - now live`);
    } else {
      toast.error(result.error || "Failed to update skill");
    }

    setIsLoading(false);
  }

  // Handle delete skill confirm
  async function handleDeleteSkill(skill: Skill) {
    setIsLoading(true);

    const result = await deleteSkill(skill.id);

    if (result.success) {
      // Remove skill from state
      const newGrouped = optimisticSkills.map((g) => ({
        ...g,
        skills: g.skills.filter((s) => s.id !== skill.id),
      }));
      setGroupedSkills(newGrouped);
      setModal({ type: "closed" });
      toast.success(`"${skill.name}" removed from site`);
    } else {
      toast.error(result.error || "Failed to delete skill");
    }

    setIsLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Skills
        </h1>
        <button
          onClick={() => setModal({ type: "add" })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          <Plus size={18} />
          Add Skill
        </button>
      </div>

      {/* Skills list with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categoryIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {optimisticSkills.map((group) => (
              <SkillCategoryComponent
                key={group.category}
                category={group.category}
                skills={group.skills}
                onEditSkill={(skill) => setModal({ type: "edit", skill })}
                onDeleteSkill={(skill) => setModal({ type: "delete", skill })}
                isDraggableCategory={true}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay */}
        <DragOverlay>
          {activeSkill && (
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: "rgba(211, 177, 150, 0.2)",
                border: "1px solid rgba(211, 177, 150, 0.4)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ color: "var(--color-text)" }}>
                {activeSkill.name}
              </span>
            </div>
          )}
          {activeCategory && (
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: "rgba(211, 177, 150, 0.2)",
                border: "1px solid rgba(211, 177, 150, 0.4)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {SKILL_CATEGORIES.find((c) => c.value === activeCategory)?.label ||
                  activeCategory}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add/Edit Modal */}
      {(modal.type === "add" || modal.type === "edit") && (
        <SkillFormModal
          mode={modal.type}
          skill={modal.type === "edit" ? modal.skill : undefined}
          isLoading={isLoading}
          onClose={() => setModal({ type: "closed" })}
          onSubmit={
            modal.type === "add"
              ? handleAddSkill
              : (formData) => handleEditSkill(modal.skill, formData)
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {modal.type === "delete" && (
        <DeleteConfirmModal
          skill={modal.skill}
          isLoading={isLoading}
          onClose={() => setModal({ type: "closed" })}
          onConfirm={() => handleDeleteSkill(modal.skill)}
        />
      )}
    </div>
  );
}

// Skill form modal component
interface SkillFormModalProps {
  mode: "add" | "edit";
  skill?: Skill;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

function SkillFormModal({
  mode,
  skill,
  isLoading,
  onClose,
  onSubmit,
}: SkillFormModalProps) {
  // Icon state
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedIconType, setSelectedIconType] = useState<"devicon" | "lucide">(
    (skill?.iconType as "devicon" | "lucide") || "lucide"
  );
  const [selectedIconId, setSelectedIconId] = useState(skill?.iconId || "code");

  // Name state for auto-suggest (add mode only)
  const [name, setName] = useState(skill?.name || "");

  // Auto-suggest icon when name changes (add mode only)
  useEffect(() => {
    if (mode !== "add") return;

    const match = findMatchingIcon(name);
    if (match) {
      setSelectedIconType("devicon");
      setSelectedIconId(match.id);
    }
  }, [name, mode]);

  // Handle icon selection from picker
  function handleIconSelect(iconId: string | null, iconType: "devicon" | "lucide") {
    if (iconId) {
      setSelectedIconType(iconType);
      setSelectedIconId(iconId);
    } else {
      // "Use default" selected - use Lucide code icon
      setSelectedIconType("lucide");
      setSelectedIconId("code");
    }
  }

  // Get display name for selected icon
  function getIconDisplayName(): string {
    if (selectedIconType === "devicon") {
      const icon = DEVICON_MAP.get(selectedIconId);
      return icon?.name || selectedIconId;
    }
    return selectedIconId;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 p-6 rounded-xl"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {mode === "add" ? "Add Skill" : "Edit Skill"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
              style={{ color: "rgba(243, 233, 226, 0.8)" }}
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(243, 233, 226, 0.05)",
                border: "1px solid rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
              placeholder="e.g., React"
            />
          </div>

          {/* Hidden inputs for icon data */}
          <input type="hidden" name="iconType" value={selectedIconType} />
          <input type="hidden" name="iconId" value={selectedIconId} />

          {/* Icon picker button */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "rgba(243, 233, 226, 0.8)" }}
            >
              Icon
            </label>
            <button
              type="button"
              onClick={() => setIconPickerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
              style={{
                backgroundColor: "rgba(243, 233, 226, 0.05)",
                border: "1px solid rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(211, 177, 150, 0.15)" }}
                >
                  <TechIcon
                    iconType={selectedIconType}
                    iconId={selectedIconId}
                    size={18}
                    className="text-primary"
                  />
                </div>
                <span className="text-sm">{getIconDisplayName()}</span>
                {selectedIconType === "devicon" && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: "rgba(211, 177, 150, 0.2)",
                      color: "var(--color-primary)",
                    }}
                  >
                    devicon
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                style={{ color: "rgba(243, 233, 226, 0.5)" }}
              />
            </button>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(243, 233, 226, 0.5)" }}
            >
              Click to browse 100+ tech icons
            </p>
          </div>

          {/* Category select */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1"
              style={{ color: "rgba(243, 233, 226, 0.8)" }}
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={skill?.category || "frontend"}
              required
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(243, 233, 226, 0.05)",
                border: "1px solid rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
            >
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Saving..." : mode === "add" ? "Add Skill" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={handleIconSelect}
        currentIconId={selectedIconType === "devicon" ? selectedIconId : null}
      />
    </div>
  );
}

// Delete confirmation modal component
interface DeleteConfirmModalProps {
  skill: Skill;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  skill,
  isLoading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 p-6 rounded-xl"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Title */}
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Delete Skill
        </h2>

        {/* Message */}
        <p
          className="mb-6"
          style={{ color: "rgba(243, 233, 226, 0.8)" }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--color-text)" }}>{skill.name}</strong>?
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
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
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
