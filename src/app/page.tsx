import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/data/portfolio";
import { SectionWrapper } from "@/app/components/portfolio/section-wrapper";
import { SectionNav } from "@/app/components/portfolio/section-nav";
import { GeometricShapes } from "@/app/components/portfolio/geometric-shapes";
import { HeroSection } from "@/app/components/portfolio/hero-section";
import { ProjectsSection } from "@/app/components/portfolio/projects-section";
import { AboutSection } from "@/app/components/portfolio/about-section";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// Generate metadata from bio data
export async function generateMetadata(): Promise<Metadata> {
  const { bio } = await getPortfolioData();

  return {
    title: bio?.name ? `${bio.name} | Portfolio` : "Portfolio",
    description: bio?.headline || "Personal portfolio website",
  };
}

export default async function Home() {
  const { bio, skills, projects, contact, socialLinks, resume } =
    await getPortfolioData();

  return (
    <main className="relative">
      <SectionNav />

      <SectionWrapper id="hero" className="relative overflow-hidden">
        <GeometricShapes />
        <HeroSection
          name={bio?.name ?? "Your Name"}
          title={bio?.title ?? "Developer"}
          headline={bio?.headline ?? "Building beautiful things"}
          resumeUrl={resume?.url ?? null}
        />
      </SectionWrapper>

      <SectionWrapper id="about">
        <AboutSection
          description={bio?.description ?? ""}
          imageUrl={bio?.imageUrl ?? null}
        />
      </SectionWrapper>

      <SectionWrapper id="skills">
        {/* Placeholder: Skills Section - Plan 04 */}
        <div className="min-h-[50vh] container mx-auto px-4">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-primary)" }}
          >
            Skills
          </h2>
          <p className="opacity-70">
            {skills.length > 0
              ? `${skills.reduce((acc, g) => acc + g.skills.length, 0)} skills across ${skills.length} categories`
              : "Skills section coming soon..."}
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper id="projects">
        <ProjectsSection projects={projects} />
      </SectionWrapper>

      <SectionWrapper id="contact">
        {/* Placeholder: Contact Section - Plan 06 */}
        <div className="min-h-[50vh] container mx-auto px-4">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-primary)" }}
          >
            Contact
          </h2>
          <p className="opacity-70">
            {contact?.email || "Contact section coming soon..."}
          </p>
          {socialLinks.length > 0 && (
            <p className="opacity-50 mt-2">
              {socialLinks.length} social links available
            </p>
          )}
          {resume && (
            <p className="opacity-50 mt-2">Resume available for download</p>
          )}
        </div>
      </SectionWrapper>
    </main>
  );
}
