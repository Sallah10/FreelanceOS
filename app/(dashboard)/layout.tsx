import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

/**
 * Dashboard Layout — wraps all routes under (dashboard)/
 *
 * Layout hierarchy:
 * RootLayout (html, body, theme)
 *   └── DashboardLayout (sidebar + topbar shell)
 *         └── page content (children)
 *
 * This is a Server Component — no "use client" needed here.
 * The sidebar and topbar are client components themselves (they handle state).
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — fixed left, handles its own collapse state */}
      <AppSidebar />

      {/* Main content area — scrollable */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar — search, notifications, user menu */}
        <DashboardTopbar />

        {/* Page content with scroll */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
