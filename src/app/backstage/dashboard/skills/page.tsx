// Skills management page - server component wrapper
// Fetches skills data and passes to client SkillsManager

import { getAllSkills } from "@/lib/actions/skills";
import { SkillsManager } from "./skills-manager";

export default async function SkillsPage() {
  const result = await getAllSkills();

  // Handle error case
  if (!result.success || !result.data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Skills
          </h1>
        </div>
        <div
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.05)",
            border: "1px solid rgba(243, 233, 226, 0.1)",
          }}
        >
          <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
            {result.error || "Failed to load skills"}
          </p>
        </div>
      </div>
    );
  }

  return <SkillsManager initialSkills={result.data} />;
}
