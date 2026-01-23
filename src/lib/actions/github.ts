"use server";

// Server actions for GitHub connection management
// These actions manage the GitHubConnection record in the database

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
} from "@/lib/github";
import type { ActionResult } from "@/lib/validations/common";
import { success, failure } from "@/lib/validations/common";
import type { GitHubConnection } from "@/generated/prisma/client";

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
