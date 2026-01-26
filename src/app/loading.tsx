import { SectionWrapper } from "@/app/components/portfolio/section-wrapper";
import { SectionDivider } from "@/app/components/portfolio/section-divider";
import { StaticGeometricShapes } from "@/app/components/portfolio/geometric-shapes";
import { SectionNavSkeleton } from "@/components/skeletons/section-nav-skeleton";
import { HeroSkeleton } from "@/components/skeletons/hero-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { SkillsSkeleton } from "@/components/skeletons/skills-skeleton";
import { ProjectsSkeleton } from "@/components/skeletons/projects-skeleton";
import { ContactSkeleton } from "@/components/skeletons/contact-skeleton";

/**
 * Route-level loading state for public portfolio.
 * Displays skeleton placeholders matching exact page layout.
 * Next.js automatically wraps page.tsx with Suspense using this component.
 */
export default function Loading() {
  return (
    <main className="relative">
      <SectionNavSkeleton />

      <SectionWrapper id="hero" className="relative overflow-hidden">
        <StaticGeometricShapes />
        <HeroSkeleton />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="about">
        <AboutSkeleton />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="skills">
        <SkillsSkeleton />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="projects">
        <ProjectsSkeleton />
      </SectionWrapper>

      <SectionDivider className="my-8 md:my-12" />

      <SectionWrapper id="contact">
        <ContactSkeleton />
      </SectionWrapper>
    </main>
  );
}
