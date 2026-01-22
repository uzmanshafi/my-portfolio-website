// Resume management page - upload and manage portfolio resume PDF
// Server component wrapper with client ResumeManager

import { getActiveResume } from "@/lib/actions/resume";
import { ResumeManager } from "./resume-manager";

export default async function ResumePage() {
  const resume = await getActiveResume();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Resume
        </h1>
        <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
          Upload your resume PDF for visitors to download
        </p>
      </div>

      {/* Client component handles upload UI and interactions */}
      <ResumeManager initialResume={resume} />
    </div>
  );
}
