const SESSION_COOKIE = "fos_session";
// 7 days in seconds
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function setSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
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
