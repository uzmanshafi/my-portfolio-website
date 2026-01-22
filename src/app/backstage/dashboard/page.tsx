// Dashboard home page - placeholder until Phase 3
// Server component that displays welcome message

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Welcome section */}
      <div className="mb-12">
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Welcome back
        </h2>
        <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
          {session?.user?.email}
        </p>
      </div>

      {/* Placeholder content */}
      <div
        className="rounded-xl p-8 text-center"
        style={{
          backgroundColor: "rgba(243, 233, 226, 0.05)",
          border: "1px solid rgba(243, 233, 226, 0.1)",
        }}
      >
        <div
          className="text-6xl mb-4 opacity-20"
          style={{ color: "var(--color-text)" }}
        >
          Coming Soon
        </div>
        <p
          className="text-lg"
          style={{ color: "rgba(243, 233, 226, 0.5)" }}
        >
          Dashboard content coming in Phase 3
        </p>
      </div>
    </div>
  );
}
