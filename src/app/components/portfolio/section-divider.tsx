interface SectionDividerProps {
  className?: string;
}

/**
 * Gradient divider line between portfolio sections.
 * Fades from transparent at edges to primary color in center.
 */
export function SectionDivider({ className = "" }: SectionDividerProps) {
  return (
    <div className={`section-divider max-w-4xl mx-auto ${className}`} />
  );
}
