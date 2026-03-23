/**
 * app/page.tsx — Root "/"
 *
 * WHY THIS FILE EXISTS:
 * Next.js App Router resolves "/" to app/page.tsx first.
 * If this file doesn't exist, it falls through to (marketing)/page.tsx.
 * Since we have both, we explicitly re-export the marketing page here.
 *
 * THE REAL REASON YOUR LANDING PAGE LOOKED EMPTY:
 * The previous version of this file did `redirect("/dashboard")` which
 * bypassed the landing page entirely. Now it renders the marketing page.
 *
 * FUTURE AUTH GUARD (when backend is live):
 * Import getServerSession, check if user is logged in.
 * If yes → redirect("/dashboard"). If no → render landing page.
 */
export { default } from "@/app/(marketing)/page";