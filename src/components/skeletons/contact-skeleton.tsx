/**
 * Contact section skeleton matching ContactSection layout.
 * Centered content with email, social links, and resume button.
 */
export function ContactSkeleton() {
  return (
    <div className="container mx-auto px-6 md:px-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Section heading - "Get In Touch" */}
        <div className="skeleton h-10 w-40 mx-auto mb-6 motion-safe:animate-shimmer" />

        {/* CTA text */}
        <div className="skeleton h-6 w-64 mx-auto mb-10 motion-safe:animate-shimmer" />

        {/* Email placeholder */}
        <div className="skeleton h-12 w-72 mx-auto mb-10 rounded-lg motion-safe:animate-shimmer" />

        {/* Social links row - 4 circular icons */}
        <div className="flex gap-4 justify-center mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton w-12 h-12 rounded-full motion-safe:animate-shimmer"
            />
          ))}
        </div>

        {/* Resume download button */}
        <div className="skeleton h-12 w-44 mx-auto rounded-lg motion-safe:animate-shimmer" />
      </div>
    </div>
  );
}
