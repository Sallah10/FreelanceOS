"use client";

/**
 * error.tsx — Next.js App Router automatic error boundary
 *
 * HOW THIS WORKS:
 * If dashboard/page.tsx throws an UNCAUGHT error, Next.js renders this
 * component instead of crashing the whole page. The rest of the shell
 * (sidebar, topbar) remains visible — only the page content is replaced.
 *
 * This catches JavaScript errors, not API errors.
 * API errors are handled inside useDashboard() with the `errors` state.
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  // Log to your error tracking service (Sentry, LogRocket, etc.) here
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>

      <div className="text-center space-y-1 max-w-sm">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          The dashboard failed to load. This is likely a temporary issue.
        </p>
        {/* Show digest in dev, hide in prod */}
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded mt-2">
            {error.message}
          </p>
        )}
      </div>

      <Button onClick={reset} variant="outline" size="sm" className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}
