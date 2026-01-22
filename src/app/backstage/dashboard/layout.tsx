// Dashboard layout - protected shell with session check
// Server component that verifies authentication before rendering

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { DashboardShell } from "@/components/admin/dashboard-shell";

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
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
