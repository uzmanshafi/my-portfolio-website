/**
 * Decorative geometric shapes for hero background.
 * Creates layered depth with positioned shapes using CSS.
 * All shapes are pointer-events-none to not interfere with clicks.
 */
export function GeometricShapes() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Large primary circle - top right with glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* Medium secondary circle - bottom left */}
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: "var(--color-secondary)" }}
      />

      {/* Small accent circle - mid right */}
      <div
        className="absolute top-1/3 right-16 w-32 h-32 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* Diagonal line - top left to center */}
      <div
        className="absolute top-20 left-20 w-64 h-px rotate-45 opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
        }}
      />

      {/* Diagonal line - bottom right */}
      <div
        className="absolute bottom-32 right-32 w-48 h-px -rotate-12 opacity-15"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
        }}
      />

      {/* Grid pattern section - subtle texture */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Scattered small dots */}
      <div
        className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full opacity-30"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
      <div
        className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full opacity-25"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 rounded-full opacity-20"
        style={{ backgroundColor: "var(--color-secondary)" }}
      />
      <div
        className="absolute top-1/2 left-1/6 w-1 h-1 rounded-full opacity-35"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* Accent glow - very subtle purple */}
      <div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-[0.08] blur-3xl"
        style={{ backgroundColor: "var(--color-accent)" }}
      />
    </div>
  );
}
