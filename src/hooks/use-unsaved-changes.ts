"use client";

// Hook for tracking unsaved form changes and warning users
// Handles browser close/refresh via beforeunload event

import { useEffect, useCallback } from "react";

interface UseUnsavedChangesOptions {
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Optional message to show (some browsers ignore custom messages) */
  message?: string;
}

/**
 * Hook that warns users when they try to leave a page with unsaved changes.
 *
 * Handles browser close/refresh via beforeunload event.
 *
 * Note on App Router navigation:
 * Next.js App Router doesn't have built-in route change interception.
 * For in-app navigation warnings, we use a separate approach:
 * - The UnsavedChangesModal component intercepts sidebar link clicks
 * - This is wired up in Plan 03-07 when all forms exist
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

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  return { isDirty };
}
