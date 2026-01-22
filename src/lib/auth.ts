// src/lib/auth.ts
// Full Auth.js configuration with authorize logic
// This file includes Node.js-only dependencies (argon2) and cannot run in Edge Runtime

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import argon2 from 'argon2';
import { authConfig } from './auth.config';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        // Validate credentials exist
        if (!email || !password) {
          return null;
        }

        // Validate against env-stored admin credentials
        if (email !== ADMIN_EMAIL) {
          return null;
        }

        // Verify password hash
        if (!ADMIN_PASSWORD_HASH) {
          console.error('ADMIN_PASSWORD_HASH not configured');
          return null;
        }

        try {
          const isValid = await argon2.verify(ADMIN_PASSWORD_HASH, password);
          if (!isValid) {
            return null;
          }
        } catch (error) {
          console.error('Password verification failed:', error);
          return null;
        }

        // Return admin user on successful authentication
        return {
          id: 'admin',
          email: ADMIN_EMAIL,
          name: 'Admin',
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt: async ({ token, user }) => {
      // Persist user data to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Expose user data from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
