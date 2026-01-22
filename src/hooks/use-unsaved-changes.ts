"use client";

// Hook for tracking unsaved form changes and warning users
// Handles browser close/refresh via beforeunload event
// Also syncs dirty state to global context for sidebar navigation

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useUnsavedChangesContext } from "@/contexts/unsaved-changes-context";

interface UseUnsavedChangesOptions {
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Optional message to show (some browsers ignore custom messages) */
  message?: string;
}

/**
 * Hook that warns users when they try to leave a page with unsaved changes.
 *
 * Features:
 * - Handles browser close/refresh via beforeunload event
 * - Syncs dirty state to global context for sidebar navigation interception
 * - Automatically registers current path with the context
 *
 * @example
 * ```tsx
 * const { isDirty } = useForm();
 * useUnsavedChanges({ isDirty });
 * ```
 */
export function useUnsavedChanges({
  isDirty,
  message = "You have unsaved changes. Leave anyway?",
}: UseUnsavedChangesOptions) {
  const pathname = usePathname();

  // Get context (may be null if not within provider)
  const context = useUnsavedChangesContext();
  const contextSetDirty = context?.setDirty ?? null;

  // Handle browser close/refresh
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        // Modern browsers ignore custom messages but require returnValue
        event.returnValue = message;
        return message;
      }
    },
    [isDirty, message]
  );

  // Sync dirty state to context for sidebar navigation
  useEffect(() => {
    if (contextSetDirty && pathname) {
      contextSetDirty(pathname, isDirty);
    }
  }, [isDirty, pathname, contextSetDirty]);

  // Set up beforeunload listener
  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // Cleanup on unmount - clear dirty state
  useEffect(() => {
    return () => {
      if (contextSetDirty && pathname) {
        contextSetDirty(pathname, false);
      }
    };
  }, [pathname, contextSetDirty]);

  return { isDirty };
}
