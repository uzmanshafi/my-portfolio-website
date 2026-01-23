"use client";

// Repository browser component with search, filter, and selection
// Displays GitHub repos in a card grid with pagination

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { RepoCard } from "@/components/admin/repo-card";
import { getRepositories, getLanguages } from "@/lib/actions/github";
import type { RepoListItem } from "@/lib/github";

const REPOS_PER_PAGE = 12;

export function ReposBrowser() {
  // Data state
  const [repos, setRepos] = useState<RepoListItem[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());

  // Fetch repositories
  const fetchRepos = useCallback(async (page: number, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const result = await getRepositories({
      page,
      perPage: REPOS_PER_PAGE,
      query: searchQuery || undefined,
      language: selectedLanguage || undefined,
    });

    if (result.success && result.data) {
      if (append) {
        setRepos((prev) => [...prev, ...result.data!.repos]);
      } else {
        setRepos(result.data.repos);
      }
      setTotalCount(result.data.totalCount);
      setHasMore(result.data.hasMore);
    } else {
      toast.error(result.error || "Failed to fetch repositories");
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, [searchQuery, selectedLanguage]);

  // Fetch languages for filter
  const fetchLanguages = useCallback(async () => {
    const result = await getLanguages();
    if (result.success && result.data) {
      setLanguages(result.data);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRepos(1);
    fetchLanguages();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchRepos(1);
  }, [searchQuery, selectedLanguage]);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchRepos(nextPage, true);
  };

  // Handle repo selection
  const handleRepoSelect = (repo: RepoListItem, selected: boolean) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(repo.id);
      } else {
        next.delete(repo.id);
      }
      return next;
    });
  };

  // Handle add selected (will be implemented in next plan)
  const handleAddSelected = () => {
    const selectedItems = repos.filter((r) => selectedRepos.has(r.id));
    toast.info(`Selected ${selectedItems.length} repos (import coming soon)`);
    // Will be replaced with actual import action in 04-04
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text)", opacity: 0.5 }}
          />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg"
            style={{
              backgroundColor: "rgba(243, 233, 226, 0.05)",
              border: "1px solid rgba(243, 233, 226, 0.1)",
              color: "var(--color-text)",
            }}
          />
        </div>

        {/* Language filter */}
        <div className="relative">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text)", opacity: 0.5 }}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-lg appearance-none cursor-pointer"
            style={{
              backgroundColor: "rgba(243, 233, 226, 0.05)",
              border: "1px solid rgba(243, 233, 226, 0.1)",
              color: "var(--color-text)",
            }}
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchRepos(1)}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.05)",
            border: "1px solid rgba(243, 233, 226, 0.1)",
            color: "var(--color-text)",
          }}
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Selection actions */}
      {selectedRepos.size > 0 && (
        <div
          className="flex items-center justify-between p-4 rounded-lg"
          style={{
            backgroundColor: "rgba(211, 177, 150, 0.1)",
            border: "1px solid rgba(211, 177, 150, 0.3)",
          }}
        >
          <span style={{ color: "var(--color-text)" }}>
            {selectedRepos.size} repo{selectedRepos.size === 1 ? "" : "s"} selected
          </span>
          <button
            onClick={handleAddSelected}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            <Plus size={18} />
            Add to Portfolio
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: "var(--color-primary)" }}
          />
        </div>
      ) : repos.length === 0 ? (
        /* Empty state */
        <div
          className="text-center py-12 rounded-xl"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.03)",
            border: "1px solid rgba(243, 233, 226, 0.1)",
          }}
        >
          <p style={{ color: "var(--color-text)", opacity: 0.6 }}>
            {searchQuery || selectedLanguage
              ? "No repositories match your filters"
              : "No repositories found"}
          </p>
        </div>
      ) : (
        /* Repos grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                selected={selectedRepos.has(repo.id)}
                onSelect={handleRepoSelect}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "rgba(243, 233, 226, 0.05)",
                  border: "1px solid rgba(243, 233, 226, 0.1)",
                  color: "var(--color-text)",
                }}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
