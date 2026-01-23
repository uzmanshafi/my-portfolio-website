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
  const currentYear = new Date().getFullYear();

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
          <div className="mb-16">
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-2 transition-all duration-200 hover:scale-105"
              style={{
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
                e.currentTarget.style.color = "var(--color-background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              aria-label="Download resume"
            >
              <Download className="w-5 h-5" />
              Download Resume
            </a>
          </div>
        )}

        {/* Footer-like ending - copyright line */}
        <div
          className="text-sm opacity-50 mt-16 pt-8 border-t"
          style={{
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "var(--color-text)",
          }}
        >
          <p>{currentYear} Built with Next.js</p>
        </div>
      </div>
    </div>
  );
}
