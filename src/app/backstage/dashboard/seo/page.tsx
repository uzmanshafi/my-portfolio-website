// SEO settings page - admin dashboard section
// Server component wrapper with client manager for editing SEO metadata

import { getSeoSettings } from "@/lib/actions/seo";
import { SeoManager } from "./seo-manager";

export default async function SeoPage() {
  const seoSettings = await getSeoSettings();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          SEO
        </h1>
        <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
          Customize how your portfolio appears in search results and social media previews
        </p>
      </div>

      <SeoManager initialData={seoSettings} />
    </div>
  );
}
