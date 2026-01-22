// Contact management page
// Server component wrapper with client ContactManager

import { getContact } from "@/lib/actions/contact";
import { getSocialLinks } from "@/lib/actions/social-links";
import { ContactManager } from "./contact-manager";

export const metadata = {
  title: "Contact | Backstage",
};

export default async function ContactPage() {
  // Fetch data server-side
  const [contact, socialLinks] = await Promise.all([
    getContact(),
    getSocialLinks(),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Contact
        </h1>
        <p style={{ color: "var(--color-text)", opacity: 0.7 }}>
          Manage your contact information and social media links.
        </p>
      </div>

      <ContactManager
        initialContact={contact}
        initialSocialLinks={socialLinks}
      />
    </div>
  );
}
