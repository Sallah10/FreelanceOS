"use client";

import { useState } from "react";
import Link from "next/link";
import {
    usePathname,
    //  useRouter 
} from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { getInitials, cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    FileText,
    BarChart3,
    Settings,
    Zap,
    LogOut,
    Menu,
    X,
    FileCheck,
    AlertTriangle,
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

// ─── Logout Confirmation Modal ────────────────────────────────────
function LogoutConfirmModal({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
            onClick={onCancel}
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
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Mobile Navigation Component ──────────────────────────────────
export function MobileNav() {
    const [open, setOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const pathname = usePathname();
    //   const router = useRouter();
    const { user, logout } = useAuth();

    const displayName = user ? `${user.firstName} ${user.lastName}` : "Account";
    const initials = user ? getInitials(displayName) : "??";

    const handleLogout = () => {
        setShowLogoutModal(false);
        setOpen(false);
        logout();
    };

    return (
        <>
            {/* Logout Modal */}
            {showLogoutModal && (
                <LogoutConfirmModal
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutModal(false)}
                />
            )}

            {/* Hamburger trigger */}
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
                    "fixed inset-y-0 left-0 z-50 w-72 flex flex-col h-screen",
                    "transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
                style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between h-14 px-5"
                    style={{ borderBottom: "1px solid var(--sidebar-border)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="font-bold text-base">FreelanceOS</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* User Info */}
                <div
                    className="flex items-center gap-3 px-5 py-4"
                    style={{ borderBottom: "1px solid var(--sidebar-border)" }}
                >
                    <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-brand">{initials}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
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

                {/* Logout Button */}
                <div
                    className="px-3 py-4"
                    style={{ borderTop: "1px solid var(--sidebar-border)" }}
                >
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign out
                    </button>
                </div>
            </div>
        </>
    );
}