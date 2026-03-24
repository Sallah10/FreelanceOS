"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useDemoAuth } from "@/lib/hooks/use-demo-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { DemoBanner } from "@/components/demo-banner";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isDemoMode } = useDemoAuth();

  useLayoutEffect(() => {
    if (isDemoMode && pathname === "/dashboard") {
      const hasSeenDemoToast = sessionStorage.getItem("demo_toast_shown");
      if (!hasSeenDemoToast) {
        sessionStorage.setItem("demo_toast_shown", "true");
        toast.info("✨ Demo Mode Active", {
          description: "You're exploring FreelanceOS. Create an account to save your data.",
          duration: 5000,
        });
      }
    }
  }, [isDemoMode, pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
        <DemoBanner />
      </div>
    </div>
  );
}