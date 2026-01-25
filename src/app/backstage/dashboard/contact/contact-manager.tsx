"use client";

// Client component for managing contact info and social links
// Handles forms, drag-and-drop, and modals

import { useState, useOptimistic, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { SortableSocialLink } from "@/components/admin/sortable-social-link";
import {
  contactSchema,
  socialLinkSchema,
  COMMON_PLATFORMS,
  type ContactFormData,
  type SocialLinkFormData,
} from "@/lib/validations/contact";
import { updateContact } from "@/lib/actions/contact";
import {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  updateSocialLinksOrder,
} from "@/lib/actions/social-links";
import type { Contact, SocialLink } from "@/generated/prisma/client";

interface ContactManagerProps {
  initialContact: Contact | null;
  initialSocialLinks: SocialLink[];
}

export function ContactManager({
  initialContact,
  initialSocialLinks,
}: ContactManagerProps) {
  // State
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [isPending, startTransition] = useTransition();
  const [optimisticLinks, setOptimisticLinks] = useOptimistic(socialLinks);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);

  // Contact form
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: initialContact?.email || "",
      location: initialContact?.location || "",
    },
    mode: "onBlur",
  });

  // Track unsaved changes for browser close warning
  useUnsavedChanges({ isDirty: contactForm.formState.isDirty });

  // Social link form (for modal)
  const socialLinkForm = useForm<SocialLinkFormData>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: {
      platform: "",
      url: "",
      icon: "",
    },
    mode: "onBlur",
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle contact form submit
  const handleContactSubmit = async (data: ContactFormData) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("location", data.location || "");

    const result = await updateContact(formData);

    if (result.success) {
      toast.success("Contact updated - now live");
      contactForm.reset(data);
    } else {
      toast.error(result.error || "Failed to save contact");
    }
  };

  // Open modal for adding new link
  const openAddModal = () => {
    setEditingLink(null);
    socialLinkForm.reset({
      platform: "",
      url: "",
      icon: "",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing link
  const openEditModal = (link: SocialLink) => {
    setEditingLink(link);
    socialLinkForm.reset({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
    });
    setIsModalOpen(true);
  };

  // Handle social link form submit
  const handleSocialLinkSubmit = async (data: SocialLinkFormData) => {
    const formData = new FormData();
    formData.append("platform", data.platform);
    formData.append("url", data.url);
    formData.append("icon", data.icon);

    if (editingLink) {
      // Update existing
      const result = await updateSocialLink(editingLink.id, formData);
      if (result.success && result.data) {
        setSocialLinks((prev) =>
          prev.map((link) =>
            link.id === editingLink.id ? result.data! : link
          )
        );
        toast.success("Social link updated - now live");
        setIsModalOpen(false);
      } else {
        toast.error(result.error || "Failed to update social link");
      }
    } else {
      // Create new
      const result = await createSocialLink(formData);
      if (result.success && result.data) {
        setSocialLinks((prev) => [...prev, result.data!]);
        toast.success("Social link added - now live");
        setIsModalOpen(false);
      } else {
        toast.error(result.error || "Failed to add social link");
      }
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteSocialLink(deleteTarget.id);
    if (result.success) {
      setSocialLinks((prev) =>
        prev.filter((link) => link.id !== deleteTarget.id)
      );
      toast.success("Social link removed from site");
    } else {
      toast.error(result.error || "Failed to delete social link");
    }
    setDeleteTarget(null);
  };

  // Handle drag end for reordering
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = socialLinks.findIndex((link) => link.id === active.id);
      const newIndex = socialLinks.findIndex((link) => link.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Calculate new order
      const reordered = arrayMove(socialLinks, oldIndex, newIndex);
      const updates = reordered.map((link, index) => ({
        id: link.id,
        order: index,
      }));

      // Optimistic update
      startTransition(async () => {
        setOptimisticLinks(reordered);
        setSocialLinks(reordered);

        const result = await updateSocialLinksOrder(updates);
        if (!result.success) {
          // Revert on error
          setSocialLinks(socialLinks);
          toast.error("Failed to save order");
        }
      });
    },
    [socialLinks, setOptimisticLinks]
  );

  // Platform suggestion click
  const selectPlatform = (platform: string, icon: string) => {
    socialLinkForm.setValue("platform", platform);
    socialLinkForm.setValue("icon", icon);
  };

  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <section
        className="p-6 rounded-lg border"
        style={{ borderColor: "rgba(243, 233, 226, 0.2)" }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Contact Information
        </h2>

        <form
          onSubmit={contactForm.handleSubmit(handleContactSubmit)}
          className="space-y-4"
        >
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text)" }}
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              {...contactForm.register("email")}
              className="w-full px-4 py-2 rounded-lg border bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={{
                borderColor: contactForm.formState.errors.email
                  ? "#ef4444"
                  : "rgba(243, 233, 226, 0.3)",
                color: "var(--color-text)",
              }}
              placeholder="your@email.com"
            />
            {contactForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {contactForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Location Field */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text)" }}
            >
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              {...contactForm.register("location")}
              className="w-full px-4 py-2 rounded-lg border bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={{
                borderColor: "rgba(243, 233, 226, 0.3)",
                color: "var(--color-text)",
              }}
              placeholder="City, Country"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                contactForm.formState.isSubmitting ||
                !contactForm.formState.isDirty
              }
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              {contactForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Social Links Section */}
      <section
        className="p-6 rounded-lg border"
        style={{ borderColor: "rgba(243, 233, 226, 0.2)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Social Links
          </h2>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            <Plus size={16} />
            Add Link
          </button>
        </div>

        {optimisticLinks.length === 0 ? (
          /* Empty State */
          <div
            className="py-12 text-center border border-dashed rounded-lg"
            style={{ borderColor: "rgba(243, 233, 226, 0.2)" }}
          >
            <LinkIcon
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--color-text)", opacity: 0.3 }}
            />
            <p style={{ color: "var(--color-text)", opacity: 0.6 }}>
              No social links yet
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text)", opacity: 0.4 }}
            >
              Add your first social media link
            </p>
          </div>
        ) : (
          /* Sortable Links List */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={optimisticLinks.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="space-y-2"
                role="list"
                aria-label="Social links"
              >
                {optimisticLinks.map((link) => (
                  <SortableSocialLink
                    key={link.id}
                    socialLink={link}
                    onEdit={openEditModal}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* Add/Edit Social Link Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="social-link-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md mx-4 p-6 rounded-lg shadow-xl"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <h3
              id="social-link-modal-title"
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              {editingLink ? "Edit Social Link" : "Add Social Link"}
            </h3>

            <form
              onSubmit={socialLinkForm.handleSubmit(handleSocialLinkSubmit)}
              className="space-y-4"
            >
              {/* Platform Name */}
              <div>
                <label
                  htmlFor="platform"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  Platform *
                </label>
                <input
                  id="platform"
                  type="text"
                  {...socialLinkForm.register("platform")}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  style={{
                    borderColor: socialLinkForm.formState.errors.platform
                      ? "#ef4444"
                      : "rgba(243, 233, 226, 0.3)",
                    color: "var(--color-text)",
                  }}
                  placeholder="e.g., GitHub"
                />
                {socialLinkForm.formState.errors.platform && (
                  <p className="mt-1 text-sm text-red-400">
                    {socialLinkForm.formState.errors.platform.message}
                  </p>
                )}

                {/* Platform Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMON_PLATFORMS.slice(0, 6).map(({ platform, icon }) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => selectPlatform(platform, icon)}
                      className="px-2 py-1 text-xs rounded border transition-colors hover:bg-white/10"
                      style={{
                        borderColor: "rgba(243, 233, 226, 0.2)",
                        color: "var(--color-text)",
                        opacity: 0.7,
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL */}
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  URL *
                </label>
                <input
                  id="url"
                  type="url"
                  {...socialLinkForm.register("url")}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  style={{
                    borderColor: socialLinkForm.formState.errors.url
                      ? "#ef4444"
                      : "rgba(243, 233, 226, 0.3)",
                    color: "var(--color-text)",
                  }}
                  placeholder="https://..."
                />
                {socialLinkForm.formState.errors.url && (
                  <p className="mt-1 text-sm text-red-400">
                    {socialLinkForm.formState.errors.url.message}
                  </p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label
                  htmlFor="icon"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  Icon Name *
                </label>
                <input
                  id="icon"
                  type="text"
                  {...socialLinkForm.register("icon")}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  style={{
                    borderColor: socialLinkForm.formState.errors.icon
                      ? "#ef4444"
                      : "rgba(243, 233, 226, 0.3)",
                    color: "var(--color-text)",
                  }}
                  placeholder="e.g., github, linkedin, twitter"
                />
                {socialLinkForm.formState.errors.icon && (
                  <p className="mt-1 text-sm text-red-400">
                    {socialLinkForm.formState.errors.icon.message}
                  </p>
                )}
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text)", opacity: 0.5 }}
                >
                  Uses Lucide icon names. Common: github, linkedin, twitter,
                  instagram, youtube, mail, globe
                </p>

                {/* Icon Preview */}
                <IconPreview iconName={socialLinkForm.watch("icon")} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  disabled={socialLinkForm.formState.isSubmitting}
                  className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  }}
                >
                  {socialLinkForm.formState.isSubmitting
                    ? "Saving..."
                    : editingLink
                    ? "Save Changes"
                    : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDeleteTarget(null)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-sm mx-4 p-6 rounded-lg shadow-xl"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            <h3
              id="delete-modal-title"
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Delete Social Link?
            </h3>
            <p
              className="mb-6"
              style={{ color: "var(--color-text)", opacity: 0.7 }}
            >
              Are you sure you want to delete the {deleteTarget.platform} link?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon preview component
import * as LucideIcons from "lucide-react";

function IconPreview({ iconName }: { iconName: string }) {
  if (!iconName) return null;

  // Convert to PascalCase
  const pascalCase = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  type IconComponent = React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  const icons = LucideIcons as unknown as Record<string, IconComponent | undefined>;
  const Icon = icons[pascalCase];

  if (!Icon) {
    return (
      <p className="text-xs text-red-400 mt-2">
        Icon &quot;{iconName}&quot; not found
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span
        className="text-xs"
        style={{ color: "var(--color-text)", opacity: 0.5 }}
      >
        Preview:
      </span>
      <Icon size={20} style={{ color: "var(--color-primary)" }} />
    </div>
  );
}
