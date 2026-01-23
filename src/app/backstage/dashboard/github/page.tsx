// GitHub integration page
// Server component that loads connection status and conditionally shows repos browser

import { getGitHubConnection } from "@/lib/actions/github";
import { GitHubSettings } from "./github-settings";
import { ReposBrowser } from "./repos-browser";

export default async function GitHubPage() {
  const result = await getGitHubConnection();
  const connection = result.success ? result.data ?? null : null;

  return (
    <div className="max-w-6xl">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        GitHub Integration
      </h1>

      <p
        className="mb-8"
        style={{ color: "var(--color-text)", opacity: 0.7 }}
      >
        Connect your GitHub account to import repositories as portfolio projects.
        Selected repos will automatically sync stars, description, and language.
      </p>

      {/* Connection settings */}
      <div className="mb-8">
        <GitHubSettings connection={connection} />
      </div>

      {/* Repository browser (only shown when connected) */}
      {connection && (
        <div className="mt-8">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Your Repositories
          </h2>
          <ReposBrowser />
        </div>
      )}
    </div>
  );
}
