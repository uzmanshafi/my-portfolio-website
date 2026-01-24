import Image from "next/image";

interface AboutSectionProps {
  description: string;
  imageUrl: string | null;
}

/**
 * About/Bio section component displaying profile image and descriptive text.
 * Two-column layout on desktop (image left, text right), single column on mobile.
 * Gracefully handles missing profile image with placeholder.
 */
export function AboutSection({ description, imageUrl }: AboutSectionProps) {
  // Split description by double newlines for paragraph formatting
  const paragraphs = description
    ? description.split(/\n\n+/).filter((p) => p.trim())
    : [];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Profile Image Column */}
        <div className="flex justify-center lg:justify-start">
          {imageUrl ? (
            <div
              className="relative w-full max-w-xs lg:max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl"
              style={{
                border: "4px solid rgba(var(--color-primary-rgb, 139, 90, 43), 0.2)",
              }}
            >
              <Image
                src={imageUrl}
                alt="Profile photo"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 320px, 448px"
                priority
                unoptimized
              />
            </div>
          ) : (
            // Placeholder when no image is available
            <div
              className="w-full max-w-xs lg:max-w-md aspect-square rounded-3xl shadow-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
              }}
            >
              {/* Placeholder icon - silhouette */}
              <svg
                className="w-24 h-24 lg:w-32 lg:h-32 opacity-30"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--color-background)" }}
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Text Content Column */}
        <div>
          {/* Section Heading */}
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: "var(--color-text)" }}
          >
            About Me
          </h2>

          {/* Bio Description */}
          {paragraphs.length > 0 ? (
            <div className="space-y-4 max-w-prose">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg leading-relaxed opacity-90 whitespace-pre-line"
                  style={{ color: "var(--color-text)" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            // Fallback when no description
            <p
              className="text-lg leading-relaxed opacity-70"
              style={{ color: "var(--color-text)" }}
            >
              More about me coming soon...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
