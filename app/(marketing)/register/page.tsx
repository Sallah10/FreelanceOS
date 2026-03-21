"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/auth-context";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Zap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// ── Schema ─────────────────────────────────────────────────────────

const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name is too long"),
        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name is too long"),
        email: z.string().email("Enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength indicator
function getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
} {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "#EF4444" };
    if (score <= 3) return { score, label: "Fair", color: "#F59E0B" };
    return { score, label: "Strong", color: "#10B981" };
}

// ── Page ───────────────────────────────────────────────────────────

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Use useWatch instead of watch to avoid React Compiler warnings
    const passwordValue = useWatch({
        control,
        name: "password",
        defaultValue: "",
    });

    const confirmPasswordValue = useWatch({
        control,
        name: "confirmPassword",
        defaultValue: "",
    });

    const strength = getPasswordStrength(passwordValue);
    const passwordsMatch = confirmPasswordValue === passwordValue && confirmPasswordValue.length > 0;

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        const result = await registerUser({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Account created! Welcome to FreelanceOS.");
            router.push("/dashboard");
        } else {
            toast.error(result.error ?? "Registration failed. Please try again.");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
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
                    className="rounded-2xl p-8 space-y-5"
                    style={{
                        background: "oklch(0.14 0.025 250)",
                        border: "1px solid oklch(1 0 0 / 8%)",
                    }}
                >
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold text-white">Create your account</h1>
                        <p className="text-sm" style={{ color: "oklch(0.55 0.015 250)" }}>
                            Start managing your freelance business today
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label="First name"
                                id="firstName"
                                error={errors.firstName?.message}
                            >
                                <input
                                    id="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    placeholder="Bello"
                                    {...register("firstName")}
                                    className="w-full rounded-xl px-3 py-3 text-sm outline-none text-white placeholder:text-white/20"
                                    style={{
                                        background: "oklch(0.18 0.02 250)",
                                        border: `1px solid ${errors.firstName ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                    }}
                                />
                            </Field>
                            <Field
                                label="Last name"
                                id="lastName"
                                error={errors.lastName?.message}
                            >
                                <input
                                    id="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    placeholder="Demo"
                                    {...register("lastName")}
                                    className="w-full rounded-xl px-3 py-3 text-sm outline-none text-white placeholder:text-white/20"
                                    style={{
                                        background: "oklch(0.18 0.02 250)",
                                        border: `1px solid ${errors.lastName ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                    }}
                                />
                            </Field>
                        </div>

                        {/* Email */}
                        <Field label="Email address" id="email" error={errors.email?.message}>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none text-white placeholder:text-white/20"
                                style={{
                                    background: "oklch(0.18 0.02 250)",
                                    border: `1px solid ${errors.email ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                }}
                            />
                        </Field>

                        {/* Password */}
                        <Field label="Password" id="password" error={errors.password?.message}>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Min. 8 characters"
                                    {...register("password")}
                                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none text-white placeholder:text-white/20"
                                    style={{
                                        background: "oklch(0.18 0.02 250)",
                                        border: `1px solid ${errors.password ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                                    style={{ color: "oklch(0.55 0.01 250)" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {passwordValue && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="flex-1 h-1 rounded-full transition-all duration-300"
                                                style={{
                                                    background:
                                                        i <= strength.score ? strength.color : "oklch(0.25 0.01 250)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs" style={{ color: strength.color }}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </Field>

                        {/* Confirm password */}
                        <Field
                            label="Confirm password"
                            id="confirmPassword"
                            error={errors.confirmPassword?.message}
                        >
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    {...register("confirmPassword")}
                                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none text-white placeholder:text-white/20"
                                    style={{
                                        background: "oklch(0.18 0.02 250)",
                                        border: `1px solid ${errors.confirmPassword ? "oklch(0.65 0.22 27 / 0.5)" : "oklch(1 0 0 / 8%)"}`,
                                    }}
                                />
                                {passwordsMatch && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]" />
                                )}
                            </div>
                        </Field>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 mt-2",
                                "py-3 rounded-xl font-semibold text-sm text-white transition-all",
                                "hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            style={{ background: "#2563EB" }}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs" style={{ color: "oklch(0.50 0.01 250)" }}>
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium" style={{ color: "#3B82F6" }}>
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: "oklch(0.35 0.01 250)" }}>
                    By creating an account you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}

// ── Field wrapper ──────────────────────────────────────────────────

function Field({
    label,
    id,
    error,
    children,
}: {
    label: string;
    id: string;
    placeholder?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={id}
                className="block text-xs font-medium"
                style={{ color: "oklch(0.70 0.01 250)" }}
            >
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}