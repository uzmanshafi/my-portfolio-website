// Projects management page
// Server component wrapper with client ProjectsManager

import { getProjects } from "@/lib/actions/projects";
import { ProjectsManager } from "./projects-manager";

export default async function ProjectsPage() {
  const result = await getProjects();
  const projects = result.success ? result.data || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Projects
        </h1>
        <p
          className="mt-1"
          style={{ color: "var(--color-text)", opacity: 0.6 }}
        >
          Manage your portfolio projects. Drag to reorder.
        </p>
      </div>

      {/* Client component for interactive management */}
      <ProjectsManager initialProjects={projects} />
    </div>
  );
}
