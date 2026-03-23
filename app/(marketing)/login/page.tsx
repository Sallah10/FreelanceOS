import { Suspense } from "react";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <LoginForm />
        </Suspense>
    );
}

function LoginFallback() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
            style={{ background: "oklch(0.10 0.02 250)" }}
        >
            <div className="w-full max-w-sm text-center">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center mb-6 animate-pulse">
                        <div className="w-4 h-4" />
                    </div>
                    <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse" />
                </div>
                <div className="rounded-2xl p-6 bg-white/5 border border-white/8">
                    <div className="space-y-4">
                        <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
                        <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
                        <div className="h-11 bg-white/10 rounded-xl animate-pulse mt-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}