# Security Policy

## Reporting a Vulnerability

If you find a security issue, please open a private security advisory on the
GitHub repository instead of a public issue.

## Notes

- Auth tokens are stored in `localStorage` (see `lib/api.ts`). This is
  convenient for a demo but is readable by any script on the page, so it is
  vulnerable to XSS. For production, prefer httpOnly cookies set by the API.
- Never put real API keys or secrets in `NEXT_PUBLIC_*` variables - they are
  embedded in the client bundle and are public.
- The backend that this app talks to must be configured with a matching
  `FRONTEND_URL` for CORS and a strong `JWT_SECRET`.

## Setup

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your
backend. Set `NEXT_PUBLIC_USE_MOCK=false` to use the real API.
