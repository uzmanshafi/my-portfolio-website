"use client";

// Modal form for creating and editing projects
// Supports image upload via Supabase signed URL

import { useEffect, useRef, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2, ImageIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  projectSchema,
  type ProjectFormInput,
} from "@/lib/validations/project";
import {
  createProject,
  updateProject,
  updateProjectImage,
} from "@/lib/actions/projects";
import { resetProjectFieldToGitHub } from "@/lib/actions/github";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Project } from "@/generated/prisma/client";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess: () => void;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: ProjectFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    project?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resettingField, setResettingField] = useState<string | null>(null);

  const isEditMode = !!project;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      imageUrl: project?.imageUrl || "",
      liveUrl: project?.liveUrl || "",
      repoUrl: project?.repoUrl || "",
      technologies: project?.technologies || [],
      featured: project?.featured || false,
    },
  });

  // Reset form when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: project?.title || "",
        description: project?.description || "",
        imageUrl: project?.imageUrl || "",
        liveUrl: project?.liveUrl || "",
        repoUrl: project?.repoUrl || "",
        technologies: project?.technologies || [],
        featured: project?.featured || false,
      });
      setImagePreview(project?.imageUrl || null);
      setImageFile(null);
      setUploadError(null);
    }
  }, [isOpen, project, reset]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    },
    [onClose, isSubmitting]
  );

  // Focus trap
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Tab" || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleTabKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTabKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown, handleTabKey]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a JPEG, PNG, WebP, or GIF image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB");
      return;
    }

    setUploadError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload image to Supabase
  const uploadImage = async (projectId: string): Promise<string | null> => {
    if (!imageFile) return imagePreview;

    try {
      const supabase = createSupabaseBrowserClient();
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `project-${projectId}-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, imageFile, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image");
      }

      const { data: publicUrl } = supabase.storage
        .from("portfolio")
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProjectFormInput) => {
    setIsSubmitting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("imageUrl", data.imageUrl || "");
      formData.append("liveUrl", data.liveUrl || "");
      formData.append("repoUrl", data.repoUrl || "");
      formData.append("technologies", JSON.stringify(data.technologies || []));
      formData.append("featured", String(data.featured || false));

      let result;
      if (isEditMode && project) {
        result = await updateProject(project.id, formData);
      } else {
        result = await createProject(formData);
      }

      if (!result.success) {
        setUploadError(result.error || "Failed to save project");
        setIsSubmitting(false);
        return;
      }

      // Upload image if there's a new file
      if (imageFile && result.data) {
        try {
          const imageUrl = await uploadImage(result.data.id);
          if (imageUrl) {
            await updateProjectImage(result.data.id, imageUrl);
          }
        } catch {
          setUploadError("Project saved but image upload failed");
          setIsSubmitting(false);
          onSuccess();
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save project:", error);
      setUploadError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle technologies input (comma-separated)
  const handleTechnologiesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const techs = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setValue("technologies", techs);
  };

  // Handle resetting a field to GitHub value
  const handleResetField = async (field: 'title' | 'description') => {
    if (!project?.id) return;

    setResettingField(field);

    const result = await resetProjectFieldToGitHub(project.id, field);

    if (result.success && result.data) {
      // Update form value
      if (field === 'title') {
        setValue('title', result.data.title);
      } else if (field === 'description') {
        setValue('description', result.data.description);
      }
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} reset to GitHub - now live`);
    } else {
      toast.error(result.error || `Failed to reset ${field}`);
    }

    setResettingField(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "rgba(243, 233, 226, 0.1)",
          }}
        >
          <h2
            id="project-form-title"
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {isEditMode ? "Edit Project" : "Add Project"}
          </h2>
          <button
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--color-text)" }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* GitHub sync info banner */}
          {project?.isGitHubSynced && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "rgba(211, 177, 150, 0.1)",
                color: "var(--color-text)",
              }}
            >
              <strong>GitHub Synced:</strong> Changes you make here will be
              preserved during automatic sync.
            </div>
          )}

          {/* Error banner */}
          {uploadError && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "#fca5a5",
              }}
            >
              {uploadError}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="title"
                className="block text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Title *
              </label>
              {project?.isGitHubSynced && project?.customizedFields?.includes('title') && (
                <button
                  type="button"
                  onClick={() => handleResetField('title')}
                  disabled={resettingField === 'title' || isSubmitting}
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: "var(--color-primary)" }}
                >
                  {resettingField === 'title' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Reset to GitHub
                </button>
              )}
            </div>
            <input
              {...register("title")}
              id="title"
              type="text"
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border bg-transparent outline-none focus:ring-2"
              style={{
                borderColor: errors.title
                  ? "#dc2626"
                  : "rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
              placeholder="My Awesome Project"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="description"
                className="block text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Description *
              </label>
              {project?.isGitHubSynced && project?.customizedFields?.includes('description') && (
                <button
                  type="button"
                  onClick={() => handleResetField('description')}
                  disabled={resettingField === 'description' || isSubmitting}
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: "var(--color-primary)" }}
                >
                  {resettingField === 'description' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Reset to GitHub
                </button>
              )}
            </div>
            <textarea
              {...register("description")}
              id="description"
              rows={4}
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border bg-transparent outline-none focus:ring-2 resize-none"
              style={{
                borderColor: errors.description
                  ? "#dc2626"
                  : "rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
              placeholder="A brief description of the project..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Project Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              disabled={isSubmitting}
              className="hidden"
            />
            <div
              className="border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors hover:opacity-80"
              style={{ borderColor: "rgba(243, 233, 226, 0.2)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative aspect-video w-full max-w-xs mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                    style={{ color: "var(--color-text)" }}
                  >
                    <Upload size={24} />
                    <span className="ml-2">Change image</span>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8"
                  style={{ color: "var(--color-text)", opacity: 0.5 }}
                >
                  <ImageIcon size={32} />
                  <p className="mt-2 text-sm">Click to upload image</p>
                  <p className="text-xs mt-1">JPEG, PNG, WebP, GIF (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Live URL */}
          <div>
            <label
              htmlFor="liveUrl"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Live URL
            </label>
            <input
              {...register("liveUrl")}
              id="liveUrl"
              type="url"
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border bg-transparent outline-none focus:ring-2"
              style={{
                borderColor: errors.liveUrl
                  ? "#dc2626"
                  : "rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
              placeholder="https://myproject.com"
            />
            {errors.liveUrl && (
              <p className="mt-1 text-sm text-red-400">
                {errors.liveUrl.message}
              </p>
            )}
          </div>

          {/* Repository URL */}
          <div>
            <label
              htmlFor="repoUrl"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Repository URL
            </label>
            <input
              {...register("repoUrl")}
              id="repoUrl"
              type="url"
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border bg-transparent outline-none focus:ring-2"
              style={{
                borderColor: errors.repoUrl
                  ? "#dc2626"
                  : "rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
              placeholder="https://github.com/user/project"
            />
            {errors.repoUrl && (
              <p className="mt-1 text-sm text-red-400">
                {errors.repoUrl.message}
              </p>
            )}
          </div>

          {/* Technologies */}
          <div>
            <label
              htmlFor="technologies"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Technologies (comma-separated)
            </label>
            <input
              id="technologies"
              type="text"
              defaultValue={project?.technologies?.join(", ") || ""}
              onChange={handleTechnologiesChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border bg-transparent outline-none focus:ring-2"
              style={{
                borderColor: "rgba(243, 233, 226, 0.2)",
                color: "var(--color-text)",
              }}
              placeholder="React, TypeScript, Tailwind CSS"
            />
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-3">
            <input
              {...register("featured")}
              id="featured"
              type="checkbox"
              disabled={isSubmitting}
              className="w-4 h-4 rounded"
            />
            <label
              htmlFor="featured"
              className="text-sm"
              style={{ color: "var(--color-text)" }}
            >
              Feature this project (shown prominently on portfolio)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
