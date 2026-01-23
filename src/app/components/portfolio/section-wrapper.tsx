import { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable section wrapper with ID for anchor linking.
 * Provides consistent vertical padding and theming.
 */
export function SectionWrapper({
  id,
  children,
  className = "",
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`py-20 md:py-32 ${className}`}
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      {children}
    </section>
  );
}
