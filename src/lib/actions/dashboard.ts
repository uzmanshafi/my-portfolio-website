"use server";

// Dashboard server actions for stats and overview
// Aggregates counts from various tables for admin dashboard home

import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  projectCount: number;
  visibleProjectCount: number;
  skillCount: number;
  skillCategoryCount: number;
  hasBio: boolean;
  hasResume: boolean;
  socialLinkCount: number;
}

/**
 * Fetch aggregate statistics for the dashboard home.
 * Returns counts of projects, skills, etc. for overview display.
 * No auth check needed - stats are not sensitive and page is protected.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Run all queries in parallel for performance
    const [
      projectCount,
      visibleProjectCount,
      skillCount,
      skillCategories,
      bio,
      activeResume,
      socialLinkCount,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { visible: true } }),
      prisma.skill.count(),
      prisma.skill.groupBy({ by: ["category"] }),
      prisma.bio.findFirst({ where: { id: "main" } }),
      prisma.resume.findFirst({ where: { active: true } }),
      prisma.socialLink.count(),
    ]);

    return {
      projectCount,
      visibleProjectCount,
      skillCount,
      skillCategoryCount: skillCategories.length,
      hasBio: bio !== null && bio.name.length > 0,
      hasResume: activeResume !== null,
      socialLinkCount,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    // Return empty stats on error
    return {
      projectCount: 0,
      visibleProjectCount: 0,
      skillCount: 0,
      skillCategoryCount: 0,
      hasBio: false,
      hasResume: false,
      socialLinkCount: 0,
    };
  }
}
