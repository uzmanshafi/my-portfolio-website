import type { Contact, SocialLink } from "@/generated/prisma/client";
import { Download } from "lucide-react";
import { CopyableEmail } from "./copyable-email";
import { SocialLinkButton } from "./social-link";

interface ContactSectionProps {
  contact: Contact | null;
  socialLinks: SocialLink[];
  resumeUrl: string | null;
}

/**
 * Contact section component serving as the page ending.
 * Displays email with click-to-copy, social links, and resume download.
 * Acts as the natural conclusion of the portfolio page (no separate footer).
 */
export function ContactSection({
  contact,
  socialLinks,
  resumeUrl,
}: ContactSectionProps) {
  return (
    <div className="container mx-auto px-6 md:px-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Section heading */}
        <h2
          className="text-3xl md:text-4xl font-bold mb-6"
          style={{ color: "var(--color-primary)" }}
        >
          Get In Touch
        </h2>

        {/* Brief CTA text */}
        <p
          className="text-lg md:text-xl opacity-80 mb-10"
          style={{ color: "var(--color-text)" }}
        >
          Interested in working together? Let&apos;s connect.
        </p>

        {/* Email section */}
        {contact?.email && (
          <div className="mb-10 flex justify-center">
            <CopyableEmail email={contact.email} />
          </div>
        )}

        {/* Social links row */}
        {socialLinks.length > 0 && (
          <div className="flex gap-4 justify-center flex-wrap mb-10">
            {socialLinks.map((link) => (
              <SocialLinkButton
                key={link.id}
                platform={link.platform}
                url={link.url}
                icon={link.icon}
              />
            ))}
          </div>
        )}

        {/* Resume download button */}
        {resumeUrl && (
          <div className="mb-8">
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-2 transition-all duration-200 hover:scale-105 bg-transparent hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-[var(--color-background)] border-[var(--color-primary)]"
              aria-label="Download resume"
            >
              <Download className="w-5 h-5" />
              Download Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
