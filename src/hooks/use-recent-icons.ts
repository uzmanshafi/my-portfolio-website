"use client";

// Hook to manage recently selected icons in localStorage
// Persists last 8 icons for quick access in icon picker

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recent-icons";
const MAX_RECENT_ICONS = 8;

export interface UseRecentIconsReturn {
  recentIcons: string[];
  addRecentIcon: (iconId: string) => void;
}

export function useRecentIcons(): UseRecentIconsReturn {
  const [recentIcons, setRecentIcons] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentIcons(parsed.slice(0, MAX_RECENT_ICONS));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Add icon to recent list
  const addRecentIcon = useCallback((iconId: string) => {
    setRecentIcons((prev) => {
      // Remove if already exists, add to front
      const filtered = prev.filter((id) => id !== iconId);
      const newRecent = [iconId, ...filtered].slice(0, MAX_RECENT_ICONS);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecent));
      } catch {
        // Ignore localStorage errors
      }

      return newRecent;
    });
  }, []);

  return { recentIcons, addRecentIcon };
}
