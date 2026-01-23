"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyableEmailProps {
  email: string;
}

/**
 * Click-to-copy email component with visual feedback.
 * Shows email prominently with copy icon, changes to checkmark on success.
 */
export function CopyableEmail({ email }: CopyableEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      aria-label={copied ? "Email copied to clipboard" : "Copy email to clipboard"}
      title={copied ? "Copied!" : "Click to copy"}
    >
      <span
        className="text-lg md:text-xl lg:text-2xl font-mono"
        style={{ color: "var(--color-text)" }}
      >
        {email}
      </span>
      {copied ? (
        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <Copy
          className="w-5 h-5 flex-shrink-0 opacity-50 transition-opacity duration-200 group-hover:opacity-100"
          style={{ color: "var(--color-primary)" }}
        />
      )}
    </button>
  );
}
