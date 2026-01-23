import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/data/portfolio";
import { SectionWrapper } from "@/app/components/portfolio/section-wrapper";
import { SectionNav } from "@/app/components/portfolio/section-nav";

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

      <SectionWrapper id="hero">
        {/* Placeholder: Hero Section - Plan 02 */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              {bio?.name || "Hero Coming Soon"}
            </h1>
            {bio?.title && (
              <p className="text-xl md:text-2xl opacity-80">{bio.title}</p>
            )}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="about">
        {/* Placeholder: About Section - Plan 03 */}
        <div className="min-h-[50vh] container mx-auto px-4">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-primary)" }}
          >
            About
          </h2>
          <p className="opacity-70">
            {bio?.headline || "About section coming soon..."}
          </p>
        </div>
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
        {/* Placeholder: Projects Section - Plan 05 */}
        <div className="min-h-[50vh] container mx-auto px-4">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-primary)" }}
          >
            Projects
          </h2>
          <p className="opacity-70">
            {projects.length > 0
              ? `${projects.length} projects to showcase`
              : "Projects section coming soon..."}
          </p>
        </div>
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
