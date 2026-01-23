"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

/**
 * Side navigation dots for desktop viewport.
 * Tracks scroll position to highlight current section.
 */
export function SectionNav() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    // Create IntersectionObserver to track which section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        // Trigger when section is 50% visible
        threshold: 0.5,
        // Adjust root margin to better detect sections
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4"
      aria-label="Section navigation"
    >
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => handleClick(e, id)}
          aria-label={`Navigate to ${label} section`}
          className="group relative flex items-center justify-center"
        >
          {/* Navigation dot */}
          <span
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${
                activeSection === id
                  ? "scale-125"
                  : "opacity-50 group-hover:opacity-80 group-hover:scale-110"
              }
            `}
            style={{
              backgroundColor:
                activeSection === id
                  ? "var(--color-primary)"
                  : "var(--color-text)",
            }}
          />

          {/* Tooltip label on hover */}
          <span
            className="
              absolute right-6 px-2 py-1 text-sm rounded
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              pointer-events-none whitespace-nowrap
            "
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-text)",
            }}
          >
            {label}
          </span>
        </a>
      ))}
    </nav>
  );
}
