// GitHub integration settings page
// Server component that loads connection status

import { getGitHubConnection } from "@/lib/actions/github";
import { GitHubSettings } from "./github-settings";

export default async function GitHubPage() {
  const result = await getGitHubConnection();
  const connection = result.success ? result.data ?? null : null;

  return (
    <div className="max-w-4xl">
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

      <GitHubSettings connection={connection} />
    </div>
  );
}
