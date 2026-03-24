"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from "lucide-react";

// ─── Validation schema ────────────────────────────────────────────

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ─────────────────────────────────────────────────────────
export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") ?? "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: LoginFormValues) => {
        const result = await login(values);

        if (result.success) {
            toast.success("Welcome back!", { description: "Redirecting to your dashboard..." });
            router.push(from);
        } else {
            toast.error("Login failed", {
                description: result.error ?? "Check your credentials and try again.",
            });
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
            style={{ background: "oklch(0.10 0.02 250)" }}
        >
            {/* Background grid texture */}
            <div
                className="fixed inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Glow */}
            <div
                className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 opacity-10 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, #2563EB 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="font-bold text-white">FreelanceOS</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        Sign in to your command center
                    </p>
                </div>

                {/* Demo credentials hint */}
                <div
                    className="mb-6 rounded-xl px-4 py-3 text-xs"
                    style={{
                        background: "oklch(0.18 0.04 264)",
                        border: "1px solid oklch(0.30 0.08 264)",
                        color: "#93C5FD",
                    }}
                >
                    <span className="font-semibold">Demo mode</span> — any email + any
                    password works
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-6"
                    style={{
                        background: "oklch(0.14 0.025 250)",
                        border: "1px solid oklch(1 0 0 / 8%)",
                    }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-xs font-medium text-white/60 uppercase tracking-wider"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className={cn(
                                    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20",
                                    "bg-white/5 border transition-colors outline-none",
                                    "focus:border-[#2563EB] focus:bg-white/8",
                                    errors.email
                                        ? "border-red-500/50 bg-red-500/5"
                                        : "border-white/8 hover:border-white/15",
                                )}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-medium text-white/60 uppercase tracking-wider"
                                >
                                    Password
                                </label>
                                <Link
                                    href="#"
                                    className="text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
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
                                        "w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20",
                                        "bg-white/5 border transition-colors outline-none",
                                        "focus:border-[#2563EB] focus:bg-white/8",
                                        errors.password
                                            ? "border-red-500/50 bg-red-500/5"
                                            : "border-white/8 hover:border-white/15",
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
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
                                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full flex items-center justify-center gap-2",
                                "bg-[#2563EB] hover:bg-[#1d4fd8] active:scale-[0.98]",
                                "text-white font-semibold text-sm py-3 rounded-xl",
                                "transition-all duration-150",
                                "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-white/35 mt-6">
                    No account?{" "}
                    <Link
                        href="/register"
                        className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
                    >
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    );
}