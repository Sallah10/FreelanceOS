"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { MobileNav } from "@/components/mobile-nav";
import { NotificationsAPI } from "@/lib/api";
import type { NotificationItem } from "@/types";
import Link from "next/link";

export function DashboardTopbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isMountedRef = useRef(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!isMountedRef.current) {
        isMountedRef.current = true;
        setMounted(true);
      }
    });
  }, []);

  useEffect(() => {
    let active = true;
    NotificationsAPI.list()
      .then((res) => {
        if (!active || !res.success || !res.data) return;
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const firstName = user?.firstName ?? "there";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-2.5 sm:px-6">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
        <MobileNav />
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          {getGreeting()},{" "}
          <span className="font-semibold text-foreground">{firstName}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative" ref={panelRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand" />
            )}
          </Button>

          {open && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-[min(20rem,calc(100vw-1rem))] sm:w-80 rounded-xl border border-border bg-background shadow-lg z-30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                    You&apos;re all caught up.
                  </p>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 border-b border-border/60 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {!item.read && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        )}
                        <div className={item.read ? "pl-3.5" : ""}>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
