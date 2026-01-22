"use client";

// Context for managing unsaved changes state across the dashboard
// Enables sidebar to show dirty indicators and intercept navigation

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface UnsavedChangesContextValue {
  /** Map of section paths to their dirty state */
  dirtyStates: Record<string, boolean>;
  /** Register a section's dirty state */
  setDirty: (path: string, isDirty: boolean) => void;
  /** URL user wants to navigate to (when blocked by dirty state) */
  pendingNavigation: string | null;
  /** Set pending navigation URL (shows modal) */
  setPendingNavigation: (url: string | null) => void;
  /** Check if any section has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Clear all dirty states (on successful save or discard) */
  clearDirty: (path: string) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(
  null
);

interface UnsavedChangesProviderProps {
  children: ReactNode;
}

/**
 * Provider for unsaved changes state.
 * Wrap dashboard content to enable cross-component dirty state tracking.
 */
export function UnsavedChangesProvider({
  children,
}: UnsavedChangesProviderProps) {
  const [dirtyStates, setDirtyStates] = useState<Record<string, boolean>>({});
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  const setDirty = useCallback((path: string, isDirty: boolean) => {
    setDirtyStates((prev) => {
      // Only update if value changed to prevent unnecessary re-renders
      if (prev[path] === isDirty) return prev;
      return { ...prev, [path]: isDirty };
    });
  }, []);

  const clearDirty = useCallback((path: string) => {
    setDirtyStates((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  // Check if any section has unsaved changes
  const hasUnsavedChanges = Object.values(dirtyStates).some(Boolean);

  return (
    <UnsavedChangesContext.Provider
      value={{
        dirtyStates,
        setDirty,
        pendingNavigation,
        setPendingNavigation,
        hasUnsavedChanges,
        clearDirty,
      }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  );
}

/**
 * Hook to access unsaved changes context.
 * Returns null if not within UnsavedChangesProvider.
 */
export function useUnsavedChangesContext() {
  return useContext(UnsavedChangesContext);
}
