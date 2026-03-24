"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileCheck,
  LogOut,
} from "lucide-react";

import { AlertTriangle } from "lucide-react";

// --------------- Nav Config ---------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Proposals", href: "/proposals", icon: FileCheck },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const BOTTOM_NAV: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

// --------------- Component ---------------

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Account";
  const initials = user ? getInitials(displayName) : "??";

  const sidebarWidth = collapsed ? "w-[64px]" : "w-[220px]";

  return (
    <TooltipProvider >
      <aside
        className={cn(
          "relative flex flex-col h-full border-r border-sidebar-border bg-sidebar",
          "transition-all duration-300 ease-in-out",
          sidebarWidth,

          "hidden md:flex",
        )}
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "gap-2",
          )}
        >
          {/* Logo icon */}
          <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-brand">
            <Zap className="w-4 h-4 text-brand-foreground fill-current" />
          </div>

          {/* Wordmark */}
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight text-sidebar-foreground">
              FreelanceOS
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "absolute -right-3 top-13 z-10 h-6 w-6 rounded-full",
            "border border-sidebar-border bg-sidebar shadow-sm",
            "text-sidebar-foreground hover:bg-sidebar-accent",
            "transition-transform duration-200",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Primary nav */}
        <nav className="flex flex-col gap-1 flex-1 px-2 py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}

          {/* User / Sign out */}
          <Tooltip>
            <TooltipTrigger >
              <div
                onClick={() => setShowLogoutModal(true)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 cursor-pointer",
                  "text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground",
                  "hover:bg-sidebar-accent transition-colors",
                  collapsed ? "justify-center" : "",
                )}
              >
                <div className="shrink-0 w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-brand">{initials}</span>
                </div>
                {!collapsed && (
                  <span className="flex-1 text-left truncate text-xs">{displayName}</span>
                )}
                {!collapsed && <LogOut className="h-3.5 w-3.5 shrink-0" />}
              </div>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Sign out</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Logout Modal */}
          {showLogoutModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowLogoutModal(false)}
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Sign out?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;ll need to sign in again to access your dashboard.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full pt-2">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutModal(false);
                        logout();
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

// --------------- NavLink ---------------

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

function NavLink({ item, isActive, collapsed }: NavLinkProps) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium",
        "transition-colors duration-150",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 h-4 w-4",
          isActive ? "text-sidebar-primary" : "text-current",
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-brand-foreground font-bold">
          {item.badge}
        </span>
      )}
    </Link>
  );


  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger >{linkContent}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}