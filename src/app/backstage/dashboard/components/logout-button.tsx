"use client";

import { useTransition } from "react";
import { logout } from "@/lib/actions/auth";
import { LogOut, Loader2 } from "lucide-react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: "rgba(243, 233, 226, 0.1)",
        color: "var(--color-text)",
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          Sign Out
        </>
      )}
    </button>
  );
}
