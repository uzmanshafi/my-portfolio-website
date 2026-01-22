"use client";

// Bio form client component
// Handles form state, validation, and image upload with cropping

import { useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User } from "lucide-react";
import { bioSchema, type BioFormData } from "@/lib/validations/bio";
import { updateBio, updateProfileImage } from "@/lib/actions/bio";
import { getSignedUploadUrl, getPublicUrl } from "@/lib/actions/storage";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { ImageCropper } from "@/components/admin/image-cropper";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface BioFormProps {
  initialData: {
    id: string;
    name: string;
    title: string;
    headline: string;
    description: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export function BioForm({ initialData }: BioFormProps) {
  // Form state with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    mode: "onBlur",
    defaultValues: {
      name: initialData?.name ?? "",
      title: initialData?.title ?? "",
      headline: initialData?.headline ?? "",
      description: initialData?.description ?? "",
    },
  });

  // Image state
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track unsaved changes
  useUnsavedChanges({ isDirty });

  // Handle form submission
  const onSubmit = async (data: BioFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("title", data.title);
    formData.append("headline", data.headline);
    formData.append("description", data.description);

    const result = await updateBio(formData);

    if (result.success) {
      toast.success("Bio saved successfully");
      // Reset form dirty state with current values
      reset(data);
    } else {
      toast.error(result.error || "Failed to save bio");
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create object URL for cropper preview
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle cropped image upload
  const handleCropComplete = async (blob: Blob) => {
    setIsUploadingImage(true);
    setSelectedImage(null);

    try {
      // Generate unique filename
      const filename = `profile/${Date.now()}.jpg`;

      // Get signed upload URL
      const urlResult = await getSignedUploadUrl("portfolio-assets", filename);
      if (!urlResult.success) {
        throw new Error(urlResult.error);
      }

      // Upload directly to Supabase Storage using signed URL
      const uploadResponse = await fetch(urlResult.data.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Get public URL for the uploaded image
      const publicUrl = await getPublicUrl("portfolio-assets", filename);

      // Update database with new image URL
      const updateResult = await updateProfileImage(publicUrl);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Update local state
      setCurrentImageUrl(publicUrl);
      toast.success("Profile image updated");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
  };

  // Input and textarea styles
  const inputStyles = {
    backgroundColor: "rgba(243, 233, 226, 0.05)",
    color: "var(--color-text)",
    border: "1px solid rgba(243, 233, 226, 0.2)",
  };

  const inputFocusStyles =
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent";

  return (
    <div className="space-y-8">
      {/* Profile Image Section */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: "rgba(243, 233, 226, 0.03)",
          border: "1px solid rgba(243, 233, 226, 0.1)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Profile Image
        </h2>

        <div className="flex items-center gap-6">
          {/* Current image or placeholder */}
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: "rgba(243, 233, 226, 0.1)",
              border: "2px solid rgba(243, 233, 226, 0.2)",
            }}
          >
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt="Profile"
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <User
                size={40}
                style={{ color: "rgba(243, 233, 226, 0.4)" }}
              />
            )}
          </div>

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="profile-image-input"
            />
            <label
              htmlFor="profile-image-input"
              className="inline-block px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: isUploadingImage
                  ? "rgba(243, 233, 226, 0.1)"
                  : "var(--color-secondary)",
                color: "var(--color-text)",
                opacity: isUploadingImage ? 0.6 : 1,
                pointerEvents: isUploadingImage ? "none" : "auto",
              }}
            >
              {isUploadingImage ? "Uploading..." : "Change Image"}
            </label>
            <p
              className="text-sm mt-2"
              style={{ color: "rgba(243, 233, 226, 0.5)" }}
            >
              JPG, PNG, or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Bio Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={`w-full px-4 py-2 rounded-lg ${inputFocusStyles}`}
            style={inputStyles}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Title field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className={`w-full px-4 py-2 rounded-lg ${inputFocusStyles}`}
            style={inputStyles}
            placeholder="Software Developer"
          />
          {errors.title && (
            <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Headline field */}
        <div>
          <label
            htmlFor="headline"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Headline
          </label>
          <input
            id="headline"
            type="text"
            {...register("headline")}
            className={`w-full px-4 py-2 rounded-lg ${inputFocusStyles}`}
            style={inputStyles}
            placeholder="Building beautiful web experiences"
          />
          {errors.headline && (
            <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
              {errors.headline.message}
            </p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={5}
            className={`w-full px-4 py-2 rounded-lg resize-none ${inputFocusStyles}`}
            style={inputStyles}
            placeholder="Tell visitors about yourself..."
          />
          {errors.description && (
            <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor:
                !isDirty || isSubmitting
                  ? "rgba(243, 233, 226, 0.1)"
                  : "var(--color-accent)",
              color: "var(--color-text)",
              cursor: !isDirty || isSubmitting ? "not-allowed" : "pointer",
              opacity: !isDirty || isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
