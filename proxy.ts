import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
