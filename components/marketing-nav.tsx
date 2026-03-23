"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
];

export function MarketingNav() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);


    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path === "/#features" && pathname === "/") return true;
        if (path !== "/" && path !== "/#features" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            {/* ========================================== */}
            {/* 1. THE NAV BAR (The Magic Glass Box)       */}
            {/* ========================================== */}
            <nav
                className="sticky top-0 z-50 w-full px-6 py-4 md:px-12"
                style={{
                    background: "oklch(0.10 0.02 250 / 0.8)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid oklch(1 0 0 / 6%)",
                }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* LEFT SIDE: Logo */}
                    <div className="flex flex-1 justify-start">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white fill-current" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">FreelanceOS</span>
                        </Link>
                    </div>

                    {/* CENTER: Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm text-white/50">
                        {NAV_ITEMS.map((item) => (
                            <Link key={item.href} href={item.href} className={cn("hover:text-white transition-colors", isActive(item.href) && "text-white")}>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT SIDE: Desktop Auth */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-3">
                        <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                            Sign in
                        </Link>
                        <Link href="/register" className="flex items-center gap-1.5 text-sm font-medium bg-[#2563EB] hover:bg-[#1d4fd8] text-white px-4 py-2 rounded-lg transition-colors">
                            Get started
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON (Hamburger) */}
                    <div className="flex md:hidden flex-1 justify-end">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ========================================== */}
            {/* 2. THE DRAWER (Rescued OUTSIDE the Nav!)   */}
            {/* ========================================== */}

            {/* Backdrop Layer */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-99 bg-black/60 md:hidden h-screen"
                    style={{ backdropFilter: "blur(4px)" }}
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sliding Menu */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-100 w-64 flex flex-col h-screen md:hidden",
                    "transition-transform duration-300 ease-out",
                    isMobileOpen ? "translate-x-0" : "translate-x-full"
                )}
                style={{ background: "oklch(0.10 0.02 250)", borderLeft: "1px solid oklch(1 0 0 / 8%)" }}
            >
                {/* Header inside drawer */}
                <div className="flex items-center justify-between h-14 px-5" style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="font-bold text-base">FreelanceOS</span>
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col gap-1 px-3 py-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
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
                    <Link href="/login" onClick={() => setIsMobileOpen(false)} className="block w-full text-center py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white mb-2">
                        Sign in
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileOpen(false)} className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1d4fd8]">
                        Get started
                    </Link>
                </div>
            </div>
        </>
    );
}