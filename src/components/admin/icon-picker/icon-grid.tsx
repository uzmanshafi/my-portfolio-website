"use client";

import { useRef, useEffect, useState } from "react";
import type { DeviconEntry } from "@/lib/icons/devicon-registry";

interface IconGridProps {
  icons: DeviconEntry[];
  focusIndex: number;
  onSelect: (iconId: string) => void;
  currentIconId: string | null;
}

export function IconGrid({
  icons,
  focusIndex,
  onSelect,
  currentIconId,
}: IconGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Scroll focused item into view
  useEffect(() => {
    if (focusIndex >= 0 && gridRef.current) {
      const items = gridRef.current.querySelectorAll("[data-icon-item]");
      const item = items[focusIndex];
      if (item) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusIndex]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-4 sm:grid-cols-6 gap-2"
      role="listbox"
    >
      {icons.map((icon, index) => {
        const IconComponent = icon.component;
        const isSelected = icon.id === currentIconId;
        const isFocused = index === focusIndex;
        const isHovered = index === hoveredIndex;

        return (
          <button
            key={icon.id}
            data-icon-item
            onClick={() => onSelect(icon.id)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative flex flex-col items-center justify-center p-3 rounded-lg transition-colors group"
            style={{
              backgroundColor: isSelected
                ? "rgba(211, 177, 150, 0.3)"
                : isFocused
                ? "rgba(243, 233, 226, 0.15)"
                : "rgba(243, 233, 226, 0.05)",
              border: isSelected
                ? "2px solid var(--color-primary)"
                : isFocused
                ? "2px solid rgba(243, 233, 226, 0.3)"
                : "2px solid transparent",
            }}
            role="option"
            aria-selected={isSelected}
            aria-label={icon.name}
          >
            <IconComponent
              color="currentColor"
              style={{
                width: 24,
                height: 24,
                color: isSelected
                  ? "var(--color-primary)"
                  : "var(--color-text)",
              }}
            />

            {/* Tooltip on hover */}
            {isHovered && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap z-10"
                style={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid rgba(243, 233, 226, 0.2)",
                  color: "var(--color-text)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                {icon.name}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
