"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { getInitials, cn } from "@/lib/utils";
import {
    LayoutDashboard, Users, FolderKanban, FileText,
    BarChart3, Settings, Zap, LogOut, Menu, X, FileCheck,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Invoices", href: "/invoices", icon: FileText },
    { label: "Proposals", href: "/proposals", icon: FileCheck },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const displayName = user ? `${user.firstName} ${user.lastName}` : "Account";
    const initials = user ? getInitials(displayName) : "??";

    return (
        <>
            {/* Hamburger trigger — only visible on mobile */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    style={{ backdropFilter: "blur(4px)" }}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 flex flex-col py-10 md:hidden ",
                    "transition-transform duration-300 ease-in-out",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
                style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between h-14 px-4 "
                    style={{ borderBottom: "1px solid var(--sidebar-border)" }}
                >
                    <div className="flex items-center gap-2 ">
                        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="font-bold text-sm">FreelanceOS</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 flex-1 px-2 py-3 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                                )}
                            >
                                <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-sidebar-primary")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + logout */}
                <div className="px-2 py-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
                    <button
                        onClick={() => { logout(); setOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-brand">{initials}</span>
                        </div>
                        <span className="flex-1 text-left truncate text-xs">{displayName}</span>
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                    </button>
                </div>
            </div>
        </>
    );
}