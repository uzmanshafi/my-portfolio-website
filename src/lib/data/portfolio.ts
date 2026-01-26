// Public data fetching layer for portfolio content
// Direct Prisma queries for server components (NOT server actions)
// NO authentication checks - public data only

import { prisma } from "@/lib/prisma";

/**
 * Log error with structured JSON for server-side debugging.
 * Outputs to console.error for Render logs visibility.
 */
function logError(error: unknown, context: { operation: string; [key: string]: unknown }) {
  const errorObj = {
    timestamp: new Date().toISOString(),
    type: error instanceof Error ? error.constructor.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    ...context,
  };
  console.error(JSON.stringify(errorObj));
}
import type {
  Bio,
  Skill,
  Project,
  Contact,
  SocialLink,
  Resume,
  SeoSettings,
} from "@/generated/prisma/client";

// Type for grouped skills by category
export type SkillCategory = "frontend" | "backend" | "tools" | "other";
export type GroupedSkills = {
  category: SkillCategory;
  skills: Skill[];
}[];

// Type for public project (exclude admin-only fields)
export type PublicProject = Pick<
  Project,
  | "id"
  | "title"
  | "description"
  | "imageUrl"
  | "liveUrl"
  | "repoUrl"
  | "technologies"
  | "featured"
  | "order"
>;

// Type for complete portfolio data
export type PortfolioData = {
  bio: Bio | null;
  skills: GroupedSkills;
  projects: PublicProject[];
  contact: Contact | null;
  socialLinks: SocialLink[];
  resume: Resume | null;
  seoSettings: SeoSettings | null;
};

/**
 * Fetch bio data for public display.
 * Returns null if bio doesn't exist. Throws on database error.
 */
export async function getPublicBio(): Promise<Bio | null> {
  try {
    const bio = await prisma.bio.findFirst();
    return bio;
  } catch (error) {
    logError(error, { operation: 'getPublicBio', table: 'Bio' });
    throw error;
  }
}

/**
 * Fetch skills grouped by category for public display.
 * Only returns visible skills, ordered by category then order field.
 */
export async function getPublicSkills(): Promise<GroupedSkills> {
  try {
    const skills = await prisma.skill.findMany({
      where: { visible: true },
      orderBy: [{ order: "asc" }],
    });

    // Group by category maintaining order
    const categoryOrder: SkillCategory[] = [
      "frontend",
      "backend",
      "tools",
      "other",
    ];
    const grouped: GroupedSkills = [];

    for (const cat of categoryOrder) {
      const categorySkills = skills.filter((s) => s.category === cat);
      if (categorySkills.length > 0) {
        grouped.push({
          category: cat,
          skills: categorySkills,
        });
      }
    }

    return grouped;
  } catch (error) {
    logError(error, { operation: 'getPublicSkills', table: 'Skill' });
    throw error;
  }
}

/**
 * Fetch visible projects for public display.
 * Ordered by order ASC, excludes GitHub sync fields and visibility status.
 */
export async function getPublicProjects(): Promise<PublicProject[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        liveUrl: true,
        repoUrl: true,
        technologies: true,
        featured: true,
        order: true,
      },
    });

    return projects;
  } catch (error) {
    logError(error, { operation: 'getPublicProjects', table: 'Project' });
    throw error;
  }
}

/**
 * Fetch contact information for public display.
 * Returns null if no contact exists. Throws on database error.
 */
export async function getPublicContact(): Promise<Contact | null> {
  try {
    const contact = await prisma.contact.findFirst();
    return contact;
  } catch (error) {
    logError(error, { operation: 'getPublicContact', table: 'Contact' });
    throw error;
  }
}

/**
 * Fetch social links for public display.
 * Only returns visible links, ordered by order field.
 */
export async function getPublicSocialLinks(): Promise<SocialLink[]> {
  try {
    const socialLinks = await prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    });
    return socialLinks;
  } catch (error) {
    logError(error, { operation: 'getPublicSocialLinks', table: 'SocialLink' });
    throw error;
  }
}

/**
 * Fetch active resume for public display.
 * Returns null if no active resume. Throws on database error.
 */
export async function getPublicResume(): Promise<Resume | null> {
  try {
    const resume = await prisma.resume.findFirst({
      where: { active: true },
    });
    return resume;
  } catch (error) {
    logError(error, { operation: 'getPublicResume', table: 'Resume' });
    throw error;
  }
}

/**
 * Fetch SEO settings for public display.
 * Returns null if no settings exist. Throws on database error.
 */
export async function getPublicSeoSettings(): Promise<SeoSettings | null> {
  try {
    const seoSettings = await prisma.seoSettings.findFirst();
    return seoSettings;
  } catch (error) {
    logError(error, { operation: 'getPublicSeoSettings', table: 'SeoSettings' });
    throw error;
  }
}

/**
 * Fetch all portfolio data in one call.
 * Runs all queries in parallel for performance.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  // TEMPORARY: Add delay for skeleton testing (remove after verification)
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const [bio, skills, projects, contact, socialLinks, resume, seoSettings] =
    await Promise.all([
      getPublicBio(),
      getPublicSkills(),
      getPublicProjects(),
      getPublicContact(),
      getPublicSocialLinks(),
      getPublicResume(),
      getPublicSeoSettings(),
    ]);

  return {
    bio,
    skills,
    projects,
    contact,
    socialLinks,
    resume,
    seoSettings,
  };
}
