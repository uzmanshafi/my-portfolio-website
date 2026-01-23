import { Octokit } from 'octokit';

/**
 * Creates an authenticated Octokit client with throttling.
 * Use this for all GitHub API interactions.
 */
export function createGitHubClient(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    throttle: {
      onRateLimit: (
        retryAfter: number,
        _options: object,
        octokit: Octokit,
        retryCount: number
      ) => {
        octokit.log.warn(`Rate limit hit, retrying after ${retryAfter}s`);
        // Retry twice on rate limit
        return retryCount < 2;
      },
      onSecondaryRateLimit: (
        retryAfter: number,
        _options: object,
        octokit: Octokit
      ) => {
        void retryAfter; // Unused but required by API
        octokit.log.warn('Secondary rate limit hit, not retrying');
        return false;
      },
    },
  });
}
