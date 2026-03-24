"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { MobileNav } from "@/components/mobile-nav";

export function DashboardTopbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isMountedRef = useRef(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!isMountedRef.current) {
        isMountedRef.current = true;
        setMounted(true);
      }
    });
  }, []);



  const firstName = user?.firstName ?? "there";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <p className="text-sm text-muted-foreground">
          {getGreeting()},{" "}
          <span className="font-semibold text-foreground">{firstName} 👋</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand" />
        </Button>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}