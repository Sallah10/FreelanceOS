"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Thin wrapper around next-themes.
 * Lives in components/ so it can be a client component
 * without making the root layout a client component.
 *
 * Why separate? Next.js App Router requires layout.tsx to be a Server Component.
 * Anything with "use client" cannot be a direct child of a Server Component's JSX —
 * it needs to be imported as a separate module like this.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
