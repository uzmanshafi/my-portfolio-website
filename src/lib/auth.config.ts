// src/lib/auth.config.ts
// Edge-compatible Auth.js configuration (no adapter, no Node.js-only dependencies)
// This file is imported by middleware.ts for route protection

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

export const authConfig = {
  pages: {
    signIn: '/backstage',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // Note: authorize function defined in auth.ts, not here
      // This is intentionally empty for Edge compatibility
    }),
    // GitHub OAuth provider - authorization logic in auth.ts
    // This stub is needed for Edge middleware compatibility
    GitHub,
  ],
  callbacks: {
    authorized: async ({ auth, request }) => {
      const isBackstage = request.nextUrl.pathname.startsWith('/backstage');
      const isLoginPage = request.nextUrl.pathname === '/backstage';
      const isLoggedIn = !!auth?.user;

      if (isLoginPage) {
        // Login page is always accessible
        return true;
      }

      if (isBackstage) {
        // Other backstage routes require authentication
        // Return isLoggedIn - middleware will handle unauthorized case
        return isLoggedIn;
      }

      // All other routes are public
      return true;
    },
  },
} satisfies NextAuthConfig;
