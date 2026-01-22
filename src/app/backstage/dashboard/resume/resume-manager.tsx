"use client";

// ResumeManager - client component for resume upload and display
// Handles file selection, validation, Supabase upload, and UI state

import { useState, useRef } from "react";
import { FileText, Upload, Eye, Trash2, RefreshCw, Loader2 } from "lucide-react";
import type { Resume } from "@/generated/prisma/client";
import { validateResumeFile } from "@/lib/validations/resume";
import { getSignedUploadUrl, getPublicUrl } from "@/lib/actions/storage";
import { uploadResume, deleteResume } from "@/lib/actions/resume";

interface ResumeManagerProps {
  initialResume: Resume | null;
}

export function ResumeManager({ initialResume }: ResumeManagerProps) {
  const [resume, setResume] = useState<Resume | null>(initialResume);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Format date nicely
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input for re-selection
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      showToast(validation.error, "error");
      return;
    }

    setIsUploading(true);

    try {
      // Get signed upload URL from server
      const storagePath = `resume/${Date.now()}_${file.name}`;
      const urlResult = await getSignedUploadUrl("portfolio-assets", storagePath);

      if (!urlResult.success) {
        showToast(urlResult.error || "Failed to get upload URL", "error");
        setIsUploading(false);
        return;
      }

      // Upload file directly to Supabase using signed URL
      const uploadResponse = await fetch(urlResult.data.signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        showToast("Failed to upload file", "error");
        setIsUploading(false);
        return;
      }

      // Create resume record in database with public URL
      const publicUrl = await getPublicUrl("portfolio-assets", storagePath);
      const result = await uploadResume(file.name, publicUrl);

      if (!result.success) {
        showToast(result.error || "Failed to save resume", "error");
        setIsUploading(false);
        return;
      }

      // Update local state with new resume
      setResume(result.data!);
      showToast("Resume uploaded successfully", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("An error occurred during upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!resume) return;

    setIsDeleting(true);

    try {
      const result = await deleteResume(resume.id);

      if (!result.success) {
        showToast(result.error || "Failed to delete resume", "error");
        setIsDeleting(false);
        return;
      }

      setResume(null);
      setShowDeleteConfirm(false);
      showToast("Resume deleted", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("An error occurred while deleting", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Trigger file picker
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Current resume display */}
      {resume ? (
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.05)",
            border: "1px solid rgba(243, 233, 226, 0.1)",
          }}
        >
          <div className="flex items-start gap-4">
            {/* PDF icon */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(243, 233, 226, 0.1)" }}
            >
              <FileText
                size={24}
                style={{ color: "var(--color-primary)" }}
              />
            </div>

            {/* Resume info */}
            <div className="flex-grow min-w-0">
              <h3
                className="font-medium truncate mb-1"
                style={{ color: "var(--color-text)" }}
              >
                {resume.filename}
              </h3>
              <p
                className="text-sm"
                style={{ color: "rgba(243, 233, 226, 0.5)" }}
              >
                Uploaded {formatDate(resume.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View button */}
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "var(--color-text)" }}
                title="View PDF"
              >
                <Eye size={18} />
              </a>

              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                style={{ color: "rgba(243, 233, 226, 0.6)" }}
                title="Delete"
                disabled={isDeleting}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Replace button */}
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: "rgba(243, 233, 226, 0.1)",
              color: "var(--color-text)",
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Replace Resume
              </>
            )}
          </button>
        </div>
      ) : (
        /* No resume state - upload prompt */
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.05)",
            border: "2px dashed rgba(243, 233, 226, 0.2)",
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(243, 233, 226, 0.1)" }}
          >
            <Upload size={28} style={{ color: "rgba(243, 233, 226, 0.4)" }} />
          </div>

          <h3
            className="text-lg font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            No resume uploaded yet
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: "rgba(243, 233, 226, 0.5)" }}
          >
            Upload a PDF file (max 10MB)
          </p>

          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-sm rounded-xl p-6"
            style={{
              backgroundColor: "var(--color-background)",
              border: "1px solid rgba(243, 233, 226, 0.1)",
            }}
          >
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Delete Resume?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "rgba(243, 233, 226, 0.6)" }}
            >
              This will remove the resume from your portfolio. Visitors will no
              longer be able to download it.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: "rgba(243, 233, 226, 0.1)",
                  color: "var(--color-text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File requirements note */}
      <p
        className="text-xs text-center"
        style={{ color: "rgba(243, 233, 226, 0.4)" }}
      >
        Accepted format: PDF only. Maximum file size: 10MB
      </p>
    </div>
  );
}
