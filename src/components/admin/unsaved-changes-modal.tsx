"use client";

// Modal component for unsaved changes warning
// Used when navigating away from a form with dirty state

import { useEffect, useRef, useCallback } from "react";

interface UnsavedChangesModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when modal requests to close (backdrop click, escape key) */
  onClose: () => void;
  /** Called when user confirms leaving (discards changes) */
  onConfirm: () => void;
  /** Called when user cancels (stays on page) */
  onCancel: () => void;
}

/**
 * Modal that warns users about unsaved changes when navigating away.
 *
 * Features:
 * - Dark backdrop overlay
 * - Focus trapped within modal when open
 * - Closes on Escape key
 * - Accessible with proper ARIA attributes
 */
export function UnsavedChangesModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: UnsavedChangesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap - cycle through focusable elements
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

  // Set up event listeners and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus the "Stay" button when modal opens
    stayButtonRef.current?.focus();

    // Add keyboard listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleTabKey);

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTabKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown, handleTabKey]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 p-6 rounded-lg shadow-xl"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Title */}
        <h2
          id="unsaved-changes-title"
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Unsaved Changes
        </h2>

        {/* Message */}
        <p
          className="mb-6"
          style={{ color: "var(--color-text)", opacity: 0.8 }}
        >
          You have unsaved changes. Leave anyway?
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            ref={stayButtonRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-text)",
              border: "1px solid rgba(243, 233, 226, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(243, 233, 226, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
