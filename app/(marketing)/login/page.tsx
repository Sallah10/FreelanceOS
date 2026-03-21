"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/auth-context";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ── Schema ─────────────────────────────────────────────────────────

const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Page ───────────────────────────────────────────────────────────

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("from") ?? "/dashboard";

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        const result = await login(data);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Welcome back!");
            router.push(redirectTo);
        } else {
            toast.error(result.error ?? "Login failed. Please try again.");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "oklch(0.10 0.02 250)" }}
        >
            {/* Background grid */}
            <div
                className="fixed inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="font-bold text-white">FreelanceOS</span>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-8 space-y-6"
                    style={{
                        background: "oklch(0.14 0.025 250)",
                        border: "1px solid oklch(1 0 0 / 8%)",
                    }}
                >
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold text-white">Welcome back</h1>
                        <p className="text-sm" style={{ color: "oklch(0.55 0.015 250)" }}>
                            Sign in to your FreelanceOS account
                        </p>
                    </div>

                    {/* Demo hint */}
                    <div
                        className="rounded-xl px-4 py-3 text-xs space-y-0.5"
                        style={{
                            background: "oklch(0.20 0.06 264)",
                            border: "1px solid oklch(0.35 0.1 264)",
                            color: "#93C5FD",
                        }}
                    >
                        <p className="font-semibold">Demo credentials</p>
                        <p style={{ color: "oklch(0.65 0.08 264)" }}>
                            demo@freelanceos.dev / Demo@12345
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-xs font-medium"
                                style={{ color: "oklch(0.70 0.01 250)" }}
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className={cn(
                                    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all",
                                    "placeholder:text-white/20 text-white",
                                    errors.email
                                        ? "border-red-500/50 focus:border-red-500"
                                        : "focus:border-[#2563EB]/60"
                                )}
                                style={{
                                    background: "oklch(0.18 0.02 250)",
                                    border: `1px solid ${errors.email ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                }}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-medium"
                                    style={{ color: "oklch(0.70 0.01 250)" }}
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs transition-colors"
                                    style={{ color: "#3B82F6" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={cn(
                                        "w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all",
                                        "placeholder:text-white/20 text-white"
                                    )}
                                    style={{
                                        background: "oklch(0.18 0.02 250)",
                                        border: `1px solid ${errors.password ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                                    style={{ color: "oklch(0.55 0.01 250)" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full flex items-center justify-center gap-2",
                                "py-3 rounded-xl font-semibold text-sm text-white transition-all",
                                "hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            style={{ background: "#2563EB" }}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs" style={{ color: "oklch(0.50 0.01 250)" }}>
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium transition-colors"
                            style={{ color: "#3B82F6" }}
                        >
                            Create one free
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: "oklch(0.35 0.01 250)" }}>
                    Payments powered by Raenest
                </p>
            </div>
        </div>
    );
}