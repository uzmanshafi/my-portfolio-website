// Dashboard home page - overview with stats and quick navigation
// Server component that displays portfolio content statistics

import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/actions/dashboard";
import {
  FolderKanban,
  Zap,
  User,
  FileText,
  Share2,
  ArrowRight,
} from "lucide-react";

// Icon props type for Lucide icons
type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Stats card component
function StatsCard({
  icon: Icon,
  label,
  value,
  subValue,
  iconColor,
}: {
  icon: React.ComponentType<IconProps>;
  label: string;
  value: string;
  subValue?: string;
  iconColor: string;
}) {
  return (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: "rgba(243, 233, 226, 0.03)",
        border: "1px solid rgba(243, 233, 226, 0.1)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </div>
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "rgba(243, 233, 226, 0.6)" }}
          >
            {label}
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            {value}
          </p>
          {subValue && (
            <p
              className="text-sm"
              style={{ color: "rgba(243, 233, 226, 0.5)" }}
            >
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick link card component
function QuickLinkCard({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<IconProps>;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group p-4 rounded-lg flex items-center gap-4 transition-all bg-[rgba(243,233,226,0.03)] border border-[rgba(243,233,226,0.1)] hover:bg-[rgba(243,233,226,0.08)] hover:border-[rgba(211,177,150,0.3)]"
    >
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: "rgba(211, 177, 150, 0.1)" }}
      >
        <Icon size={20} style={{ color: "var(--color-primary)" }} />
      </div>
      <div className="flex-1">
        <p className="font-medium" style={{ color: "var(--color-text)" }}>
          {label}
        </p>
        <p
          className="text-sm"
          style={{ color: "rgba(243, 233, 226, 0.5)" }}
        >
          {description}
        </p>
      </div>
      <ArrowRight
        size={18}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--color-primary)" }}
      />
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Welcome section */}
      <div className="mb-12">
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Welcome back
        </h2>
        <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
          {session?.user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-12">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Content Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            icon={FolderKanban}
            label="Projects"
            value={`${stats.projectCount} projects`}
            subValue={`${stats.visibleProjectCount} visible`}
            iconColor="#d3b196"
          />
          <StatsCard
            icon={Zap}
            label="Skills"
            value={`${stats.skillCount} skills`}
            subValue={`${stats.skillCategoryCount} categories`}
            iconColor="#c9a67a"
          />
          <StatsCard
            icon={User}
            label="Bio"
            value={stats.hasBio ? "Configured" : "Not set"}
            iconColor="#b89b7a"
          />
          <StatsCard
            icon={FileText}
            label="Resume"
            value={stats.hasResume ? "Uploaded" : "No resume"}
            iconColor="#a89070"
          />
          <StatsCard
            icon={Share2}
            label="Social Links"
            value={`${stats.socialLinkCount} links`}
            iconColor="#988566"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickLinkCard
            href="/backstage/dashboard/bio"
            icon={User}
            label="Edit Bio"
            description="Update your personal information"
          />
          <QuickLinkCard
            href="/backstage/dashboard/skills"
            icon={Zap}
            label="Manage Skills"
            description="Add or edit your technical skills"
          />
          <QuickLinkCard
            href="/backstage/dashboard/projects"
            icon={FolderKanban}
            label="Manage Projects"
            description="Showcase your work portfolio"
          />
          <QuickLinkCard
            href="/backstage/dashboard/resume"
            icon={FileText}
            label="Upload Resume"
            description="Keep your resume up to date"
          />
          <QuickLinkCard
            href="/backstage/dashboard/contact"
            icon={Share2}
            label="Update Contact"
            description="Manage contact info and social links"
          />
        </div>
      </div>
    </div>
  );
}
