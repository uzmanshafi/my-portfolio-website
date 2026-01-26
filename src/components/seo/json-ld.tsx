import type { Person, WebSite, WithContext } from "schema-dts";

interface JsonLdProps {
  bio: { name: string; title: string; imageUrl?: string | null } | null;
  siteUrl: string;
  socialLinks: { url: string }[];
}

export function JsonLd({ bio, siteUrl, socialLinks }: JsonLdProps) {
  // Build Person schema with sameAs for social profiles
  const personSchema: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: bio?.name || "Developer",
    jobTitle: bio?.title || "Software Developer",
    url: siteUrl,
    image: bio?.imageUrl || undefined,
    sameAs: socialLinks.map((link) => link.url),
  };

  // Build WebSite schema
  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${bio?.name || "Developer"} Portfolio`,
    url: siteUrl,
  };

  // Sanitize to prevent XSS (replace < with unicode escape)
  const sanitize = (obj: object) =>
    JSON.stringify(obj).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitize(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitize(websiteSchema) }}
      />
    </>
  );
}
