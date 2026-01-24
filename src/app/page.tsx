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
