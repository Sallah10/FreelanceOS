/**
 * cookies.ts — Client-side cookie helpers
 *
 * WHY WE NEED THIS:
 * Next.js middleware runs on the Edge and can ONLY read cookies — not localStorage.
 * So when the user logs in, we need to set BOTH:
 *   1. localStorage("fos_token") → for the axios API client
 *   2. document.cookie("fos_session") → for the middleware route guard
 *
 * These are two different mechanisms serving two different purposes.
 */

const SESSION_COOKIE = "fos_session";
// 7 days in seconds
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function setSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
  // SameSite=Strict prevents CSRF. Secure flag should be true in production.
  const isProduction = process.env.NODE_ENV === "production";
  document.cookie = [
    `${SESSION_COOKIE}=${token}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    "Path=/",
    "SameSite=Strict",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  // Setting Max-Age=0 immediately expires the cookie
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
}
