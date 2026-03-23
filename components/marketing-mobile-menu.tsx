"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
];

export function MarketingMobileMenu() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/#features" && pathname === "/") return true;
        if (href !== "/#features" && pathname === href) return true;
        return false;
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60"
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
                    "fixed inset-y-0 right-0 z-50 w-64 flex flex-col h-screen",
                    "transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
                style={{ background: "oklch(0.10 0.02 250)", borderLeft: "1px solid oklch(1 0 0 / 8%)" }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between h-14 px-5"
                    style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="font-bold text-base">FreelanceOS</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 px-3 py-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "bg-[#2563EB]/20 text-[#2563EB]"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white mb-2"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/register"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1d4fd8]"
                    >
                        Get started
                    </Link>
                </div>
            </div>
        </>
    );
}