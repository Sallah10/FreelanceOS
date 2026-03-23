"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Zap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotFormValues>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: ForgotFormValues) => {
        // Mock API call — replace with actual when backend is ready
        await new Promise((resolve) => setTimeout(resolve, 800));

        setEmail(values.email);
        setSubmitted(true);
        toast.success("Reset link sent!", {
            description: `Check ${values.email} for password reset instructions.`,
        });
    };

    if (submitted) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center px-4"
                style={{ background: "oklch(0.10 0.02 250)" }}
            >
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                    <p className="text-white/40 mb-6">
                        We sent a password reset link to <span className="text-white font-medium">{email}</span>
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-brand hover:text-brand/80 transition-colors"
                    >
                        Back to sign in
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4"
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
                        Reset password
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        Enter your email to receive a reset link
                    </p>
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
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send reset link
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-white/35 mt-6">
                    Remember your password?{" "}
                    <Link
                        href="/login"
                        className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}