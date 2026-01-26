"use client";

// Placeholder component - full implementation in 08-02-PLAN.md
// This minimal version fixes TypeScript compilation for 08-03

interface SeoManagerProps {
  initialData: {
    id: string;
    ogImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
}

export function SeoManager({ initialData }: SeoManagerProps) {
  return (
    <div
      className="p-6 rounded-lg"
      style={{ backgroundColor: "rgba(243, 233, 226, 0.05)" }}
    >
      <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
        SEO settings form coming soon.
      </p>
      {initialData && (
        <div className="mt-4 text-sm" style={{ color: "rgba(243, 233, 226, 0.4)" }}>
          <p>Current title: {initialData.seoTitle || "(not set)"}</p>
          <p>Current description: {initialData.seoDescription || "(not set)"}</p>
        </div>
      )}
    </div>
  );
}
