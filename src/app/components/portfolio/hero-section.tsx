interface HeroSectionProps {
  name: string;
  title: string;
  headline: string;
  resumeUrl: string | null;
}

/**
 * Hero section component displaying bio information and CTAs.
 * Features name, title, headline with clear typography hierarchy.
 * Two CTAs: View Projects (anchor) and Download Resume (conditional).
 */
export function HeroSection({
  name,
  title,
  headline,
  resumeUrl,
}: HeroSectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-8">
      <div className="max-w-4xl text-center">
        {/* Name - Primary heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          {name}
        </h1>

        {/* Title/Role - Secondary heading with accent color */}
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-medium mb-6"
          style={{ color: "var(--color-primary)" }}
        >
          {title}
        </h2>

        {/* Headline/Tagline - Body text */}
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 opacity-80"
          style={{ color: "var(--color-text)" }}
        >
          {headline}
        </p>

        {/* CTAs container */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-12">
          {/* View Projects - Primary CTA */}
          <a
            href="#projects"
            className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
            aria-label="View my projects"
          >
            View Projects
          </a>

          {/* Download Resume - Secondary CTA (conditional) */}
          {resumeUrl && (
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium border-2 transition-all duration-200 hover:scale-105"
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
              aria-label="Download my resume"
            >
              Download Resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
