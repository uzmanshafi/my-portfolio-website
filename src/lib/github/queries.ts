// GitHub API query functions using Octokit
// These are used by server actions for fetching repository data

import type { Octokit } from 'octokit';
import type { GitHubRepo, RepoListItem } from './types';
import { toRepoListItem } from './types';

export interface ReposResponse {
  repos: RepoListItem[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Fetch user repositories with pagination.
 * Returns simplified repo objects for UI display.
 */
export async function fetchUserRepos(
  octokit: Octokit,
  options: {
    page?: number;
    perPage?: number;
    sort?: 'updated' | 'created' | 'pushed' | 'full_name';
  } = {}
): Promise<ReposResponse> {
  const { page = 1, perPage = 30, sort = 'updated' } = options;

  const response = await octokit.rest.repos.listForAuthenticatedUser({
    sort,
    direction: 'desc',
    per_page: perPage,
    page,
    visibility: 'all',
  });

  const repos = response.data.map((repo) =>
    toRepoListItem(repo as GitHubRepo)
  );

  return {
    repos,
    totalCount: repos.length, // Note: GitHub doesn't provide total count easily
    hasMore: response.data.length === perPage,
  };
}

/**
 * Search user repositories by name with optional language filter.
 * Fetches all repos and filters client-side (GitHub search API has limitations).
 */
export async function searchUserRepos(
  octokit: Octokit,
  options: {
    query?: string;
    language?: string;
    page?: number;
    perPage?: number;
  } = {}
): Promise<ReposResponse> {
  const { query = '', language, page = 1, perPage = 30 } = options;

  // Fetch all repos (up to 100 per page for efficiency)
  // Note: For users with many repos, consider caching or pagination
  const response = await octokit.rest.repos.listForAuthenticatedUser({
    sort: 'updated',
    direction: 'desc',
    per_page: 100,
    visibility: 'all',
  });

  let allRepos = response.data.map((repo) =>
    toRepoListItem(repo as GitHubRepo)
  );

  // Filter by search query (case-insensitive name match)
  if (query) {
    const lowerQuery = query.toLowerCase();
    allRepos = allRepos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(lowerQuery) ||
        repo.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by language
  if (language) {
    allRepos = allRepos.filter(
      (repo) => repo.language?.toLowerCase() === language.toLowerCase()
    );
  }

  // Paginate filtered results
  const startIndex = (page - 1) * perPage;
  const paginatedRepos = allRepos.slice(startIndex, startIndex + perPage);

  return {
    repos: paginatedRepos,
    totalCount: allRepos.length,
    hasMore: startIndex + perPage < allRepos.length,
  };
}

/**
 * Get unique languages from user's repositories.
 * Useful for building the language filter dropdown.
 */
export async function getRepoLanguages(octokit: Octokit): Promise<string[]> {
  const response = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: 100,
    visibility: 'all',
  });

  const languages = new Set<string>();
  for (const repo of response.data) {
    if (repo.language) {
      languages.add(repo.language);
    }
  }

  return Array.from(languages).sort();
}
