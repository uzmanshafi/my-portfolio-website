"use client";

import type { Contact, SocialLink } from "@/generated/prisma/client";
import { motion } from "motion/react";
import { Download } from "lucide-react";
import { AnimatedSection } from "@/components/animation/animated-section";
import { itemVariants } from "@/lib/animation/variants";
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
 * Includes scroll-triggered reveal with staggered elements.
 */
export function ContactSection({
  contact,
  socialLinks,
  resumeUrl,
}: ContactSectionProps) {
  return (
    <AnimatedSection>
      <div className="container mx-auto px-6 md:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-2xl mx-auto"
        >
          {/* Section heading - reveals first */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: "var(--color-primary)" }}
          >
            Get In Touch
          </motion.h2>

          {/* Brief CTA text */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl opacity-80 mb-10"
            style={{ color: "var(--color-text)" }}
          >
            Interested in working together? Let&apos;s connect.
          </motion.p>

          {/* Email section */}
          {contact?.email && (
            <motion.div variants={itemVariants} className="mb-10 flex justify-center">
              <CopyableEmail email={contact.email} />
            </motion.div>
          )}

          {/* Social links row - stagger each link */}
          {socialLinks.length > 0 && (
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="flex gap-4 justify-center flex-wrap mb-10"
            >
              {socialLinks.map((link) => (
                <motion.div key={link.id} variants={itemVariants}>
                  <SocialLinkButton
                    platform={link.platform}
                    url={link.url}
                    icon={link.icon}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Resume download button - reveals last */}
          {resumeUrl && (
            <motion.div variants={itemVariants} className="mb-8">
              <a
                href={resumeUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-2 transition-all duration-200 hover:scale-105 bg-transparent hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-[var(--color-background)] border-[var(--color-primary)]"
                aria-label="Download resume"
              >
                <Download className="w-5 h-5" />
                Download Resume
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
