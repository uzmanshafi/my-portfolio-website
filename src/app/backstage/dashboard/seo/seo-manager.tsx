"use client";

// SEO manager client component
// Handles OG image upload and SEO text field editing

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { updateSeoSettings, updateOgImage } from "@/lib/actions/seo";
import { getSignedUploadUrl, getPublicUrl } from "@/lib/actions/storage";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { ImageCropper } from "@/components/admin/image-cropper";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Character limits
const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

// OG image dimensions
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

interface SeoManagerProps {
  initialData: {
    id: string;
    ogImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export function SeoManager({ initialData }: SeoManagerProps) {
  // Form state
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Image state
  const [currentOgImageUrl, setCurrentOgImageUrl] = useState<string | null>(
    initialData?.ogImageUrl ?? null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track dirty state - compare with initial values
  const isDirty =
    seoTitle !== (initialData?.seoTitle ?? "") ||
    seoDescription !== (initialData?.seoDescription ?? "");

  // Track unsaved changes
  useUnsavedChanges({ isDirty });

  // Handle form submission
  const handleSave = async () => {
    setIsSaving(true);

    const formData = new FormData();
    formData.append("seoTitle", seoTitle);
    formData.append("seoDescription", seoDescription);

    const result = await updateSeoSettings(formData);

    if (result.success) {
      toast.success("SEO settings now live");
    } else {
      toast.error(result.error || "Failed to save SEO settings");
    }

    setIsSaving(false);
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
      const filename = `og-images/${Date.now()}.jpg`;

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
      const updateResult = await updateOgImage(publicUrl);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Update local state
      setCurrentOgImageUrl(publicUrl);
      toast.success("OG image now live");
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

  // Input styles
  const inputStyles = {
    backgroundColor: "rgba(243, 233, 226, 0.05)",
    color: "var(--color-text)",
    border: "1px solid rgba(243, 233, 226, 0.2)",
  };

  const inputFocusStyles =
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent";

  return (
    <div className="space-y-8">
      {/* OG Image Section */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: "rgba(243, 233, 226, 0.03)",
          border: "1px solid rgba(243, 233, 226, 0.1)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Social Share Image
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: "rgba(243, 233, 226, 0.6)" }}
        >
          This image appears when your portfolio is shared on social media ({OG_WIDTH}x{OG_HEIGHT}px)
        </p>

        <div className="space-y-4">
          {/* Current OG image preview */}
          <div
            className="relative w-full overflow-hidden rounded-lg flex items-center justify-center"
            style={{
              aspectRatio: `${OG_WIDTH}/${OG_HEIGHT}`,
              backgroundColor: "rgba(243, 233, 226, 0.1)",
              border: "2px solid rgba(243, 233, 226, 0.2)",
              maxWidth: "480px",
            }}
          >
            {currentOgImageUrl ? (
              <Image
                src={currentOgImageUrl}
                alt="OG Image Preview"
                fill
                sizes="480px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon
                  size={48}
                  style={{ color: "rgba(243, 233, 226, 0.4)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(243, 233, 226, 0.4)" }}
                >
                  No image uploaded
                </span>
              </div>
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
              id="og-image-input"
            />
            <label
              htmlFor="og-image-input"
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
              {isUploadingImage ? "Uploading..." : currentOgImageUrl ? "Change Image" : "Upload Image"}
            </label>
            <p
              className="text-sm mt-2"
              style={{ color: "rgba(243, 233, 226, 0.5)" }}
            >
              JPG, PNG, or GIF. Max 5MB. Will be cropped to {OG_WIDTH}x{OG_HEIGHT}px.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Text Fields Section */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: "rgba(243, 233, 226, 0.03)",
          border: "1px solid rgba(243, 233, 226, 0.1)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Search Engine Metadata
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: "rgba(243, 233, 226, 0.6)" }}
        >
          Leave empty to use your bio data as fallback
        </p>

        <div className="space-y-6">
          {/* SEO Title */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="seo-title"
                className="block text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                SEO Title
              </label>
              <span
                className="text-sm"
                style={{
                  color:
                    seoTitle.length > SEO_TITLE_MAX
                      ? "#ef4444"
                      : "rgba(243, 233, 226, 0.5)",
                }}
              >
                {seoTitle.length}/{SEO_TITLE_MAX}
              </span>
            </div>
            <input
              id="seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              maxLength={SEO_TITLE_MAX}
              className={`w-full px-4 py-2 rounded-lg ${inputFocusStyles}`}
              style={inputStyles}
              placeholder="Your Name | Portfolio"
            />
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(243, 233, 226, 0.4)" }}
            >
              Fallback: bio name + title
            </p>
          </div>

          {/* SEO Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="seo-description"
                className="block text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                SEO Description
              </label>
              <span
                className="text-sm"
                style={{
                  color:
                    seoDescription.length > SEO_DESCRIPTION_MAX
                      ? "#ef4444"
                      : "rgba(243, 233, 226, 0.5)",
                }}
              >
                {seoDescription.length}/{SEO_DESCRIPTION_MAX}
              </span>
            </div>
            <textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              maxLength={SEO_DESCRIPTION_MAX}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg resize-none ${inputFocusStyles}`}
              style={inputStyles}
              placeholder="A brief description of your portfolio for search engines..."
            />
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(243, 233, 226, 0.4)" }}
            >
              Fallback: bio headline
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor:
                !isDirty || isSaving
                  ? "rgba(243, 233, 226, 0.1)"
                  : "var(--color-accent)",
              color: "var(--color-text)",
              cursor: !isDirty || isSaving ? "not-allowed" : "pointer",
              opacity: !isDirty || isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={OG_WIDTH / OG_HEIGHT}
          cropShape="rect"
        />
      )}
    </div>
  );
}
