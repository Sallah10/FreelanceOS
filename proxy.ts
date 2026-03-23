import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * middleware.ts — Route guard
 *
 * HOW NEXT.JS MIDDLEWARE WORKS (important concept):
 * This file runs on the EDGE — before React, before the page renders,
 * before even the layout. It's the bouncer at the door.
 *
 * When a user navigates to /dashboard:
 * 1. Edge runtime reads this middleware FIRST
 * 2. We check for the token cookie
 * 3. If no token → redirect to /login instantly (no flash of dashboard)
 * 4. If token exists → let the request through
 *
 * WHY COOKIE AND NOT LOCALSTORAGE?
 * localStorage is not accessible in Edge/Node environments — only in the browser.
 * Middleware runs on the server, so it can only read cookies.
 *
 * FLOW:
 * - On login: we SET a cookie (in addition to localStorage) so middleware can read it
 * - On logout: we CLEAR the cookie
 * - localStorage is still used for the API client (axios interceptor)
 *
 * NOTE: In USE_MOCK mode, we use a simple presence check.
 * In production, you'd verify the JWT signature here using jose/jsonwebtoken.
 */

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/clients",
  "/projects",
  "/invoices",
  "/proposals",
  "/analytics",
  "/settings",
];

// Routes that logged-in users shouldn't see (redirect to dashboard)
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies
  // We use a cookie named "fos_session" set during login
  const token = request.cookies.get("fos_session")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * matcher tells Next.js which routes to run middleware on.
 * We exclude static assets and API routes — no need to check auth there.
 */
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico
     * - Public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
