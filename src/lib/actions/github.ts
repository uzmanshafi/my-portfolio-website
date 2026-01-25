"use server";

// Server actions for GitHub connection management
// These actions manage the GitHubConnection record in the database

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  encryptToken,
  decryptToken,
  createGitHubClient,
  fetchUserRepos,
  searchUserRepos,
  getRepoLanguages,
  type ReposResponse,
  type RepoListItem,
} from "@/lib/github";
import type { ActionResult } from "@/lib/validations/common";
import { success, failure } from "@/lib/validations/common";
import type { GitHubConnection, Project } from "@/generated/prisma/client";

/**
 * Get the current GitHub connection status.
 * Returns the connection record if exists, null otherwise.
 */
export async function getGitHubConnection(): Promise<ActionResult<GitHubConnection | null>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    // Only one connection allowed (single admin)
    const connection = await prisma.gitHubConnection.findFirst();
    return success(connection);
  } catch (error) {
    console.error("Failed to get GitHub connection:", error);
    return failure("Failed to get GitHub connection");
  }
}

/**
 * Store GitHub connection after OAuth callback.
 * Called from Auth.js linkAccount event.
 * @internal - Not meant to be called directly from UI
 */
export async function storeGitHubConnection(
  accessToken: string,
  _providerAccountId: string
): Promise<ActionResult<GitHubConnection>> {
  try {
    // Encrypt the access token before storing
    const encryptedToken = await encryptToken(accessToken);

    // Get user info from GitHub to store username
    const octokit = createGitHubClient(accessToken);
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Upsert connection (replace existing if any)
    const connection = await prisma.gitHubConnection.upsert({
      where: { id: "github-connection" }, // Use fixed ID for singleton
      update: {
        accessToken: encryptedToken,
        username: user.login,
        avatarUrl: user.avatar_url,
        connectedAt: new Date(),
        syncError: null,
      },
      create: {
        id: "github-connection",
        accessToken: encryptedToken,
        username: user.login,
        avatarUrl: user.avatar_url,
      },
    });

    return success(connection);
  } catch (error) {
    console.error("Failed to store GitHub connection:", error);
    return failure("Failed to store GitHub connection");
  }
}

/**
 * Disconnect GitHub account.
 * Removes the stored token but keeps synced projects intact.
 */
export async function disconnectGitHub(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    await prisma.gitHubConnection.deleteMany();
    return success();
  } catch (error) {
    console.error("Failed to disconnect GitHub:", error);
    return failure("Failed to disconnect GitHub");
  }
}

/**
 * Get the decrypted access token for API calls.
 * @internal - Used by other GitHub actions, not exposed to client
 */
export async function getGitHubAccessToken(): Promise<string | null> {
  try {
    const connection = await prisma.gitHubConnection.findFirst();
    if (!connection) {
      return null;
    }
    return await decryptToken(connection.accessToken);
  } catch (error) {
    console.error("Failed to get GitHub access token:", error);
    return null;
  }
}

/**
 * Get repositories from connected GitHub account.
 * Supports pagination, search, and language filtering.
 */
export async function getRepositories(options: {
  page?: number;
  perPage?: number;
  query?: string;
  language?: string;
} = {}): Promise<ActionResult<ReposResponse>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    return failure("GitHub not connected");
  }

  try {
    const octokit = createGitHubClient(accessToken);

    // Use search if query or language filter provided
    if (options.query || options.language) {
      const result = await searchUserRepos(octokit, options);
      return success(result);
    }

    // Otherwise use simple pagination
    const result = await fetchUserRepos(octokit, options);
    return success(result);
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return failure("Failed to fetch repositories from GitHub");
  }
}

/**
 * Get available languages for filter dropdown.
 */
export async function getLanguages(): Promise<ActionResult<string[]>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    return failure("GitHub not connected");
  }

  try {
    const octokit = createGitHubClient(accessToken);
    const languages = await getRepoLanguages(octokit);
    return success(languages);
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return failure("Failed to fetch languages");
  }
}

/**
 * Import selected GitHub repositories as portfolio projects.
 * Creates new Project records with GitHub sync enabled.
 */
export async function importRepositoriesAsProjects(
  repos: RepoListItem[]
): Promise<ActionResult<Project[]>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  if (repos.length === 0) {
    return failure("No repositories selected");
  }

  try {
    // Get current max order for new projects
    const maxOrder = await prisma.project.aggregate({
      _max: { order: true },
    });
    let nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Check which repos are already imported (by githubId)
    const existingGithubIds = await prisma.project.findMany({
      where: {
        githubId: { in: repos.map((r) => r.id) },
      },
      select: { githubId: true },
    });
    const existingIds = new Set(existingGithubIds.map((p) => p.githubId));

    // Filter out already imported repos
    const newRepos = repos.filter((r) => !existingIds.has(r.id));

    if (newRepos.length === 0) {
      return failure("All selected repositories are already imported");
    }

    // Create projects in a transaction
    const projects = await prisma.$transaction(
      newRepos.map((repo) => {
        const project = prisma.project.create({
          data: {
            title: repo.name,
            description: repo.description || `GitHub repository: ${repo.fullName}`,
            repoUrl: repo.url,
            githubId: repo.id,
            githubFullName: repo.fullName,
            stars: repo.stars,
            forks: repo.forks,
            language: repo.language,
            isGitHubSynced: true,
            customizedFields: [], // No customizations yet
            lastSyncedAt: new Date(),
            technologies: repo.language ? [repo.language] : [],
            visible: true,
            featured: false,
            order: nextOrder++,
          },
        });
        return project;
      })
    );

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/backstage/dashboard/github");
    revalidatePath("/");

    return success(projects);
  } catch (error) {
    console.error("Failed to import repositories:", error);
    return failure("Failed to import repositories");
  }
}

/**
 * Check which repos from a list are already imported.
 * Returns array of githubIds that exist as projects.
 */
export async function getImportedRepoIds(
  githubIds: number[]
): Promise<ActionResult<number[]>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    const existing = await prisma.project.findMany({
      where: {
        githubId: { in: githubIds },
      },
      select: { githubId: true },
    });

    return success(existing.map((p) => p.githubId!).filter(Boolean));
  } catch (error) {
    console.error("Failed to check imported repos:", error);
    return failure("Failed to check imported repos");
  }
}

/**
 * Sync all GitHub-synced projects with latest data from GitHub.
 * Respects customizedFields - skips fields the admin has edited.
 * Marks projects as hidden if source repo is deleted or made private.
 *
 * @internal - Called by cron job, not directly from UI
 */
export async function syncGitHubProjects(): Promise<ActionResult<{
  synced: number;
  hidden: number;
  errors: string[];
}>> {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    return failure("GitHub not connected");
  }

  try {
    const octokit = createGitHubClient(accessToken);

    // Get all GitHub-synced projects
    const projects = await prisma.project.findMany({
      where: { isGitHubSynced: true },
    });

    if (projects.length === 0) {
      return success({ synced: 0, hidden: 0, errors: [] });
    }

    let synced = 0;
    let hidden = 0;
    const errors: string[] = [];

    for (const project of projects) {
      if (!project.githubFullName) {
        errors.push(`Project ${project.id} missing githubFullName`);
        continue;
      }

      const [owner, repo] = project.githubFullName.split('/');

      try {
        const { data: repoData } = await octokit.rest.repos.get({
          owner,
          repo,
        });

        // Build update data, respecting customizedFields
        const customized = new Set(project.customizedFields || []);
        const updateData: Record<string, unknown> = {
          lastSyncedAt: new Date(),
        };

        // Only update fields that haven't been customized
        if (!customized.has('title')) {
          updateData.title = repoData.name;
        }
        if (!customized.has('description')) {
          updateData.description = repoData.description || `GitHub repository: ${repoData.full_name}`;
        }

        // Always update stats (not customizable)
        updateData.stars = repoData.stargazers_count;
        updateData.forks = repoData.forks_count;
        updateData.language = repoData.language;

        // Unhide if it was hidden due to missing repo
        if (!project.visible && !customized.has('visible')) {
          updateData.visible = true;
        }

        await prisma.project.update({
          where: { id: project.id },
          data: updateData,
        });

        synced++;
      } catch (repoError: unknown) {
        // Handle 404 (deleted) or 403 (private/no access)
        const status = (repoError as { status?: number }).status;
        if (status === 404 || status === 403) {
          // Hide the project but don't delete it
          await prisma.project.update({
            where: { id: project.id },
            data: {
              visible: false,
              lastSyncedAt: new Date(),
            },
          });
          hidden++;
        } else {
          const message = repoError instanceof Error ? repoError.message : String(repoError);
          errors.push(`Failed to sync ${project.githubFullName}: ${message}`);
        }
      }
    }

    // Update GitHubConnection with sync status
    await prisma.gitHubConnection.updateMany({
      data: {
        lastSyncAt: new Date(),
        syncError: errors.length > 0 ? errors.join('; ') : null,
      },
    });

    return success({ synced, hidden, errors });
  } catch (error) {
    console.error("Failed to sync GitHub projects:", error);

    // Record sync error
    await prisma.gitHubConnection.updateMany({
      data: {
        syncError: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return failure("Failed to sync GitHub projects");
  }
}

/**
 * Reset a specific field on a GitHub-synced project to the GitHub value.
 * Removes the field from customizedFields array.
 */
export async function resetProjectFieldToGitHub(
  projectId: string,
  field: 'title' | 'description'
): Promise<ActionResult<Project>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    return failure("GitHub not connected");
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return failure("Project not found");
    }

    if (!project.isGitHubSynced || !project.githubFullName) {
      return failure("Project is not GitHub-synced");
    }

    // Fetch current GitHub data
    const octokit = createGitHubClient(accessToken);
    const [owner, repo] = project.githubFullName.split('/');

    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Get the GitHub value for the field
    let githubValue: string;
    switch (field) {
      case 'title':
        githubValue = repoData.name;
        break;
      case 'description':
        githubValue = repoData.description || `GitHub repository: ${repoData.full_name}`;
        break;
      default:
        return failure(`Cannot reset field: ${field}`);
    }

    // Remove field from customizedFields
    const customizedFields = (project.customizedFields || []).filter(
      (f) => f !== field
    );

    // Update project
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        [field]: githubValue,
        customizedFields,
      },
    });

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");

    return success(updated);
  } catch (error) {
    console.error("Failed to reset field:", error);
    return failure("Failed to reset field to GitHub value");
  }
}
