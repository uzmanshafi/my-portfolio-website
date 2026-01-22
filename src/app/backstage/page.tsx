// Login page at /backstage
// Split layout: login form on left, portfolio preview on right

import { LoginForm } from "./components/login-form";

export default function BackstageLoginPage() {
  return (
    <main
      className="min-h-screen grid lg:grid-cols-2"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Left side - Login form */}
      <div className="flex flex-col items-center justify-center px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Backstage
            </h1>
            <p
              className="text-sm"
              style={{ color: "rgba(243, 233, 226, 0.6)" }}
            >
              Sign in to manage your portfolio
            </p>
          </div>

          {/* Login form */}
          <LoginForm />
        </div>
      </div>

      {/* Right side - Portfolio preview / abstract pattern */}
      <div
        className="hidden lg:flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg,
            var(--color-background) 0%,
            rgba(50, 105, 120, 0.3) 50%,
            rgba(102, 85, 184, 0.2) 100%)`,
        }}
      >
        {/* Abstract decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle */}
          <div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{
              backgroundColor: "var(--color-primary)",
              top: "10%",
              right: "-10%",
            }}
          />
          {/* Medium circle */}
          <div
            className="absolute w-64 h-64 rounded-full opacity-15"
            style={{
              backgroundColor: "var(--color-secondary)",
              bottom: "20%",
              left: "10%",
            }}
          />
          {/* Small accent circle */}
          <div
            className="absolute w-32 h-32 rounded-full opacity-20"
            style={{
              backgroundColor: "var(--color-accent)",
              top: "40%",
              right: "30%",
            }}
          />
        </div>

        {/* Preview content */}
        <div className="relative z-10 text-center px-8">
          <div
            className="text-6xl font-bold mb-4 opacity-20"
            style={{ color: "var(--color-text)" }}
          >
            Portfolio
          </div>
          <div
            className="text-lg opacity-40"
            style={{ color: "var(--color-text)" }}
          >
            Content management awaits
          </div>
        </div>
      </div>
    </main>
  );
}
