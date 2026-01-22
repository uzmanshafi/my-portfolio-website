// Dashboard layout - protected shell with session check
// Server component that verifies authentication before rendering

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layer 2: Server-side session check (Layer 1 is middleware)
  const session = await auth();

  if (!session?.user) {
    redirect("/backstage");
  }

  return (
    <SessionProvider session={session}>
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Sidebar handles both desktop (fixed) and mobile (overlay) */}
        <Sidebar />

        {/* Main content area - offset on desktop for fixed sidebar */}
        <main className="lg:pl-60">
          {/* Content wrapper with padding */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
