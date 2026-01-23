interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean; // Use stronger glass effect
  withGrain?: boolean; // Add grain texture
}

/**
 * Reusable glass card wrapper with glassmorphism and optional grain texture.
 * Applies frosted glass effect with subtle grain overlay.
 */
export function GlassCard({
  children,
  className = "",
  strong = false,
  withGrain = true,
}: GlassCardProps) {
  return (
    <div
      className={`
        ${strong ? "glass-card-strong" : "glass-card"}
        ${withGrain ? "grain" : ""}
        rounded-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}
