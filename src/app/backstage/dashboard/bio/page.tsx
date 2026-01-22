// Bio editing page - admin dashboard section
// Server component wrapper with client form for editing

import { getBio } from "@/lib/actions/bio";
import { BioForm } from "./bio-form";

export default async function BioPage() {
  const bio = await getBio();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Bio
        </h1>
        <p style={{ color: "rgba(243, 233, 226, 0.6)" }}>
          Edit your personal information and profile image
        </p>
      </div>

      <BioForm initialData={bio} />
    </div>
  );
}
