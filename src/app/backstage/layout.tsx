// Backstage layout - wrapper for all backstage routes
// No session provider here (that's for dashboard layout)

export default function BackstageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
