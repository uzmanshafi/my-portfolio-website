// Types for GitHub API responses (subset of full API types)

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string; // owner/repo
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  private: boolean;
  updated_at: string;
  topics: string[];
}

// Simplified repo for UI display
export interface RepoListItem {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  isPrivate: boolean;
  updatedAt: string;
  topics: string[];
}

// Transform GitHub API response to simplified type
export function toRepoListItem(repo: GitHubRepo): RepoListItem {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    isPrivate: repo.private,
    updatedAt: repo.updated_at,
    topics: repo.topics,
  };
}
