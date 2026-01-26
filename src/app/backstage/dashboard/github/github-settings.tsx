"use client";

// Client component for GitHub connection management
// Shows connect/disconnect button and connection status

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Github, Unlink, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { disconnectGitHub } from "@/lib/actions/github";
import type { GitHubConnection } from "@/generated/prisma/client";

interface GitHubSettingsProps {
  connection: GitHubConnection | null;
}

export function GitHubSettings({ connection }: GitHubSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Handle connect - redirects to GitHub OAuth
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Use signIn to trigger GitHub OAuth flow
      // redirect: false prevents full page reload, we handle it manually
      await signIn("github", {
        callbackUrl: "/backstage/dashboard/github",
      });
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      toast.error("Failed to connect GitHub");
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    const result = await disconnectGitHub();

    if (result.success) {
      toast.success("GitHub disconnected");
      // Reload to refresh connection status
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to disconnect");
      setIsDisconnecting(false);
    }
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "rgba(243, 233, 226, 0.05)",
        border: "1px solid rgba(243, 233, 226, 0.1)",
      }}
    >
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: "var(--color-text)" }}
      >
        <Github size={20} />
        GitHub Account
      </h2>

      {connection ? (
        // Connected state
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {connection.avatarUrl && (
              <Image
                src={connection.avatarUrl}
                alt={connection.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                {connection.username}
              </p>
              <p
                className="text-sm flex items-center gap-1"
                style={{ color: "var(--color-text)", opacity: 0.6 }}
              >
                <CheckCircle size={14} className="text-green-500" />
                Connected
              </p>
            </div>
          </div>

          {connection.lastSyncAt && (
            <p
              className="text-sm"
              style={{ color: "var(--color-text)", opacity: 0.5 }}
            >
              Last synced: {new Date(connection.lastSyncAt).toLocaleDateString()}
            </p>
          )}

          {connection.syncError && (
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
              }}
            >
              Sync error: {connection.syncError}
            </p>
          )}

          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-text)",
              border: "1px solid rgba(243, 233, 226, 0.3)",
              opacity: isDisconnecting ? 0.7 : 1,
            }}
          >
            {isDisconnecting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <Unlink size={18} />
                Disconnect GitHub
              </>
            )}
          </button>
        </div>
      ) : (
        // Disconnected state
        <div className="space-y-4">
          <p
            className="text-sm"
            style={{ color: "var(--color-text)", opacity: 0.6 }}
          >
            Connect your GitHub account to browse and import your repositories.
          </p>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
              opacity: isConnecting ? 0.7 : 1,
            }}
          >
            {isConnecting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github size={18} />
                Connect GitHub
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
