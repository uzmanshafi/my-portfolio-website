// Dashboard layout - protected shell with session check
// Server component that verifies authentication before rendering

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { LogoutButton } from "./components/logout-button";

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
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "rgba(243, 233, 226, 0.1)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Backstage
            </h1>
            <LogoutButton />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </SessionProvider>
  );
}
