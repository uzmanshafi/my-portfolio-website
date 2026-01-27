"use client";

import { Search } from "lucide-react";
import { useRef, useEffect } from "react";

interface IconSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function IconSearch({
  value,
  onChange,
  placeholder = "Search icons...",
}: IconSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "rgba(243, 233, 226, 0.5)" }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: "rgba(243, 233, 226, 0.05)",
          border: "1px solid rgba(243, 233, 226, 0.2)",
          color: "var(--color-text)",
        }}
      />
    </div>
  );
}
