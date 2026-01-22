"use client";

// Dashboard shell client component
// Wraps sidebar and content with UnsavedChangesProvider for shared state

import { type ReactNode } from "react";
import { UnsavedChangesProvider } from "@/contexts/unsaved-changes-context";
import { Sidebar } from "@/components/admin/sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Client component wrapper for dashboard content.
 * Provides unsaved changes context for sidebar navigation interception.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <UnsavedChangesProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Sidebar handles both desktop (fixed) and mobile (overlay) */}
        <Sidebar />

        {/* Main content area - offset on desktop for fixed sidebar */}
        <main className="lg:pl-60">
          {/* Content wrapper with padding */}
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </UnsavedChangesProvider>
  );
}
