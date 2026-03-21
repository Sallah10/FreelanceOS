import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * middleware.ts — Route Guard
 *
 * Lives at the project ROOT (same level as app/, not inside it).
 * Runs on the Edge runtime BEFORE any page renders — zero flash of protected content.
 *
 * PROTECTED: anything under /dashboard, /clients, /invoices, /projects, /analytics, /settings
 * PUBLIC:    /, /login, /register, /api/*
 *
 * Auth strategy (mock phase):
 *   We check for a "fos_token" cookie. When the user logs in, we set this cookie.
 *   When the backend is live, the token is verified server-side.
 *   For now, presence of the cookie = authenticated.
 *
 * WHY COOKIE not localStorage?
 *   middleware.ts runs on the server/edge — it has no access to localStorage (browser only).
 *   Cookies are sent with every request, so the edge can read them.
 *   This is also the more secure pattern (httpOnly cookies resist XSS).
 */

const PROTECTED_PATHS = [
  "/dashboard",
  "/clients",
  "/projects",
  "/invoices",
  "/proposals",
  "/analytics",
  "/settings",
];

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this path is public (explicit allowlist)
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path);

  // Check if this path needs protection
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  // If it's public OR not protected, allow access
  if (isPublic || !isProtected) return NextResponse.next();

  // Look for auth token in cookies
  const token = request.cookies.get("fos_token")?.value;

  if (!token) {
    // Redirect to login, preserving the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these paths — skip static files, images, fonts
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
