// middleware.ts - Route protection for /backstage/* routes
// Returns 404 for unauthenticated access (hides admin existence)
// Redirects authenticated users from login page to dashboard

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isBackstage = req.nextUrl.pathname.startsWith("/backstage");
  const isLoginPage = req.nextUrl.pathname === "/backstage";
  const isLoggedIn = !!req.auth;

  // Login page: redirect to dashboard if already logged in
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/backstage/dashboard", req.url));
  }

  // Protected routes: return 404 if not logged in (hide admin existence)
  if (isBackstage && !isLoginPage && !isLoggedIn) {
    // Rewrite to not-found page (pretend route doesn't exist)
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/backstage/:path*"],
};
