"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Zap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────
const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, "First name is required")
            .min(2, "First name too short")
            .max(50),
        lastName: z
            .string()
            .min(1, "Last name is required")
            .min(2, "Last name too short")
            .max(50),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Enter a valid email address"),
        password: z
            .string()
            .min(8, "Minimum 8 characters")
            .regex(/[A-Z]/, "Include at least one uppercase letter")
            .regex(/[0-9]/, "Include at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Password strength indicator ─────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "8+ characters", pass: password.length >= 8 },
        { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
        { label: "Number", pass: /[0-9]/.test(password) },
    ];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-1">
            {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5">
                    <CheckCircle2
                        className={cn("w-3 h-3 transition-colors", c.pass ? "text-green-400" : "text-white/20")}
                    />
                    <span className={cn("text-xs transition-colors", c.pass ? "text-white/50" : "text-white/20")}>
                        {c.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { register: registerUser } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const watchedPassword = useWatch({
        control,
        name: "password",
        defaultValue: "",
    });

    const onSubmit = async (values: RegisterFormValues) => {
        const result = await registerUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
        });

        if (result.success) {
            toast.success("Account created!", {
                description: "Welcome to FreelanceOS. Let's get you set up.",
            });
            router.push("/dashboard");
        } else {
            toast.error("Registration failed", {
                description: result.error ?? "Please try again.",
            });
        }
    };

    // ── Reusable field renderer ──────────────────────────────────────
    const inputClass = (hasError: boolean) =>
        cn(
            "w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20",
            "bg-white/5 border transition-colors outline-none",
            "focus:border-[#2563EB]",
            hasError
                ? "border-red-500/50 bg-red-500/5"
                : "border-white/8 hover:border-white/15",
        );

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
            style={{ background: "oklch(0.10 0.02 250)" }}
        >
            {/* Background texture */}
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
                        Create your account
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        Free forever · Raenest payments included
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
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                                    First name
                                </label>
                                <input
                                    type="text"
                                    autoComplete="given-name"
                                    placeholder="Bello"
                                    {...register("firstName")}
                                    className={inputClass(!!errors.firstName)}
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-red-400">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    autoComplete="family-name"
                                    placeholder="Ade"
                                    {...register("lastName")}
                                    className={inputClass(!!errors.lastName)}
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-red-400">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className={inputClass(!!errors.email)}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={cn(inputClass(!!errors.password), "pr-11")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400">{errors.password.message}</p>
                            )}
                            <PasswordStrength password={watchedPassword} />
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                                Confirm password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                {...register("confirmPassword")}
                                className={inputClass(!!errors.confirmPassword)}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 mt-2",
                                "bg-[#2563EB] hover:bg-[#1d4fd8] active:scale-[0.98]",
                                "text-white font-semibold text-sm py-3 rounded-xl",
                                "transition-all duration-150",
                                "disabled:opacity-60 disabled:cursor-not-allowed",
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[11px] text-white/20 pt-1">
                            By creating an account you agree to our Terms of Service
                        </p>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-white/35 mt-6">
                    Already have an account?{" "}
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