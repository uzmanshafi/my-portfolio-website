import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/data/portfolio";
import { SectionWrapper } from "@/app/components/portfolio/section-wrapper";
import { SectionNav } from "@/app/components/portfolio/section-nav";
import { GeometricShapes } from "@/app/components/portfolio/geometric-shapes";
import { HeroSection } from "@/app/components/portfolio/hero-section";
import { ProjectsSection } from "@/app/components/portfolio/projects-section";
import { AboutSection } from "@/app/components/portfolio/about-section";
import { ContactSection } from "@/app/components/portfolio/contact-section";
import { SkillsSection } from "@/app/components/portfolio/skills-section";
import { SectionDivider } from "@/app/components/portfolio/section-divider";
import { JsonLd } from "@/components/seo/json-ld";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// Generate metadata with Open Graph and Twitter Card support
export async function generateMetadata(): Promise<Metadata> {
  const { bio, seoSettings } = await getPortfolioData();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

  // Build title with fallback chain: seoSettings -> bio -> default
  const title =
    seoSettings?.seoTitle ||
    (bio?.name && bio?.title ? `${bio.name} | ${bio.title}` : "Portfolio");

  // Build description with fallback chain: seoSettings -> bio -> default
  const description =
    seoSettings?.seoDescription ||
    bio?.headline ||
    "Personal portfolio website";

  // Build OG image URL with fallback chain: seoSettings -> bio -> default
  const ogImageUrl =
    seoSettings?.ogImageUrl || bio?.imageUrl || `${siteUrl}/og-image.png`;

  const siteName = bio?.name ? `${bio.name} Portfolio` : "Portfolio";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,

    // Open Graph - Facebook, LinkedIn, most platforms
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${bio?.name || "Portfolio"} preview`,
        },
      ],
      type: "website",
      locale: "en_US",
    },

    // Twitter/X - Large image card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },

    // Additional LinkedIn-preferred tags
    other: bio?.name
      ? {
          "article:author": bio.name,
        }
      : undefined,
  };
}

export default async function Home() {
  const { bio, skills, projects, contact, socialLinks, resume } =
    await getPortfolioData();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

  return (
    <main className="relative">
      {/* JSON-LD structured data for search engines */}
      <JsonLd bio={bio} siteUrl={siteUrl} socialLinks={socialLinks} />

      <SectionNav />

      <SectionWrapper id="hero" className="relative overflow-hidden">
        <GeometricShapes />
        <HeroSection
          name={bio?.name ?? "Your Name"}
          title={bio?.title ?? "Developer"}
          headline={bio?.headline ?? "Building beautiful things"}
          location={contact?.location ?? null}
          resumeUrl={resume?.url ?? null}
        />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="about">
        <AboutSection
          description={bio?.description ?? ""}
          imageUrl={bio?.imageUrl ?? null}
        />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="skills">
        <SkillsSection skills={skills} />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="projects">
        <ProjectsSection projects={projects} />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="contact">
        <ContactSection
          contact={contact}
          socialLinks={socialLinks}
          resumeUrl={resume?.url ?? null}
        />
      </SectionWrapper>
    </main>
  );
}
