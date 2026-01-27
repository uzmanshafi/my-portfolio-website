"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  DEVICON_REGISTRY,
  DEVICON_MAP,
  type IconCategory,
} from "@/lib/icons/devicon-registry";
import { DEVICON_CATEGORIES } from "@/lib/icons/icon-categories";
import { useRecentIcons } from "@/hooks/use-recent-icons";
import { IconSearch } from "./icon-search";
import { IconGrid } from "./icon-grid";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconId: string | null, iconType: "devicon" | "lucide") => void;
  currentIconId: string | null;
}

export function IconPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentIconId,
}: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IconCategory | "all">("all");
  const [focusIndex, setFocusIndex] = useState(0);
  const { recentIcons, addRecentIcon } = useRecentIcons();

  // Filter icons based on search and category
  const filteredIcons = DEVICON_REGISTRY.filter((icon) => {
    const matchesCategory =
      category === "all" || icon.category === category;

    if (!search.trim()) return matchesCategory;

    const searchLower = search.toLowerCase();
    const matchesSearch =
      icon.name.toLowerCase().includes(searchLower) ||
      icon.id.includes(searchLower) ||
      icon.aliases.some((alias) => alias.includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  // Get recent icons that exist in registry
  const validRecentIcons = recentIcons
    .map((id) => DEVICON_MAP.get(id))
    .filter((icon): icon is NonNullable<typeof icon> => icon !== undefined);

  // Calculate grid columns for keyboard nav (matches CSS grid)
  const columns = 6;

  // Reset focus when filter changes
  useEffect(() => {
    setFocusIndex(0);
  }, [search, category]);

  // Handle icon selection
  const handleSelect = useCallback(
    (iconId: string | null) => {
      if (iconId) {
        addRecentIcon(iconId);
        onSelect(iconId, "devicon");
      } else {
        // "Use default" option - use Lucide
        onSelect(null, "lucide");
      }
      onClose();
    },
    [addRecentIcon, onSelect, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusIndex((i) => Math.min(i + 1, filteredIcons.length - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) =>
            Math.min(i + columns, filteredIcons.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - columns, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredIcons[focusIndex]) {
            handleSelect(filteredIcons[focusIndex].id);
          }
          break;
      }
    },
    [isOpen, filteredIcons, focusIndex, columns, onClose, handleSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setCategory("all");
      setFocusIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[80vh] mx-4 rounded-xl flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(243, 233, 226, 0.1)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Select Icon
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and category tabs */}
        <div className="px-6 py-4 space-y-4">
          <IconSearch value={search} onChange={setSearch} />

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {DEVICON_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{
                  backgroundColor:
                    category === cat.value
                      ? "var(--color-primary)"
                      : "rgba(243, 233, 226, 0.1)",
                  color:
                    category === cat.value
                      ? "var(--color-background)"
                      : "var(--color-text)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Use default option */}
          <button
            onClick={() => handleSelect(null)}
            className="w-full mb-4 px-4 py-2 text-sm rounded-lg text-left transition-colors hover:bg-white/10"
            style={{
              backgroundColor: "rgba(243, 233, 226, 0.05)",
              border: "1px solid rgba(243, 233, 226, 0.1)",
              color: "rgba(243, 233, 226, 0.7)",
            }}
          >
            Use category default icon (Lucide)
          </button>

          {/* Recent icons */}
          {validRecentIcons.length > 0 && !search && category === "all" && (
            <div className="mb-6">
              <h3
                className="text-sm font-medium mb-2"
                style={{ color: "rgba(243, 233, 226, 0.6)" }}
              >
                Recently used
              </h3>
              <IconGrid
                icons={validRecentIcons}
                focusIndex={-1}
                onSelect={handleSelect}
                currentIconId={currentIconId}
              />
            </div>
          )}

          {/* All icons */}
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: "rgba(243, 233, 226, 0.6)" }}
          >
            {search
              ? `${filteredIcons.length} results`
              : category === "all"
              ? "All icons"
              : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h3>

          {filteredIcons.length > 0 ? (
            <IconGrid
              icons={filteredIcons}
              focusIndex={focusIndex}
              onSelect={handleSelect}
              currentIconId={currentIconId}
            />
          ) : (
            <p
              className="text-center py-8"
              style={{ color: "rgba(243, 233, 226, 0.5)" }}
            >
              No icons found
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-6 py-3 text-xs border-t"
          style={{
            borderColor: "rgba(243, 233, 226, 0.1)",
            color: "rgba(243, 233, 226, 0.4)",
          }}
        >
          Arrow keys to navigate, Enter to select, Escape to close
        </div>
      </div>
    </div>
  );
}
