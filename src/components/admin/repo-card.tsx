"use client";

// Repository card component for displaying GitHub repos
// Shows name, description, stars, language, and selection checkbox

import { Star, GitFork, Lock, Globe } from "lucide-react";
import type { RepoListItem } from "@/lib/github";

interface RepoCardProps {
  repo: RepoListItem;
  selected: boolean;
  onSelect: (repo: RepoListItem, selected: boolean) => void;
  disabled?: boolean;
}

export function RepoCard({ repo, selected, onSelect, disabled }: RepoCardProps) {
  return (
    <div
      className={`relative rounded-xl p-4 transition-all cursor-pointer ${
        selected ? "ring-2" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        backgroundColor: "rgba(243, 233, 226, 0.05)",
        border: "1px solid rgba(243, 233, 226, 0.1)",
        ...(selected && { ringColor: "var(--color-primary)" }),
      }}
      onClick={() => !disabled && onSelect(repo, !selected)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(repo, e.target.checked)}
          disabled={disabled}
          className="w-5 h-5 rounded accent-[var(--color-primary)]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Repo name with privacy indicator */}
      <div className="flex items-center gap-2 mb-2 pr-8">
        {repo.isPrivate ? (
          <Lock size={14} style={{ color: "var(--color-text)", opacity: 0.5 }} />
        ) : (
          <Globe size={14} style={{ color: "var(--color-text)", opacity: 0.5 }} />
        )}
        <h3
          className="font-semibold truncate"
          style={{ color: "var(--color-text)" }}
        >
          {repo.name}
        </h3>
      </div>

      {/* Description */}
      <p
        className="text-sm mb-3 line-clamp-2 min-h-[2.5rem]"
        style={{ color: "var(--color-text)", opacity: 0.7 }}
      >
        {repo.description || "No description"}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm">
        {/* Language */}
        {repo.language && (
          <span
            className="flex items-center gap-1"
            style={{ color: "var(--color-text)", opacity: 0.6 }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            {repo.language}
          </span>
        )}

        {/* Stars */}
        <span
          className="flex items-center gap-1"
          style={{ color: "var(--color-text)", opacity: 0.6 }}
        >
          <Star size={14} />
          {repo.stars.toLocaleString()}
        </span>

        {/* Forks */}
        <span
          className="flex items-center gap-1"
          style={{ color: "var(--color-text)", opacity: 0.6 }}
        >
          <GitFork size={14} />
          {repo.forks.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
