"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-6">
      {/* Error banner */}
      {state?.error && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
          }}
          role="alert"
        >
          {state.error}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium"
          style={{ color: "var(--color-text)" }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
          className="w-full px-4 py-3 rounded-lg text-base transition-colors outline-none"
          style={{
            backgroundColor: "rgba(243, 233, 226, 0.05)",
            border: "1px solid rgba(243, 233, 226, 0.2)",
            color: "var(--color-text)",
          }}
          placeholder="admin@example.com"
        />
      </div>

      {/* Password field with visibility toggle */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: "var(--color-text)" }}
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={isPending}
            className="w-full px-4 py-3 pr-12 rounded-lg text-base transition-colors outline-none"
            style={{
              backgroundColor: "rgba(243, 233, 226, 0.05)",
              border: "1px solid rgba(243, 233, 226, 0.2)",
              color: "var(--color-text)",
            }}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ color: "var(--color-text)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 rounded-lg font-medium text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
        }}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
