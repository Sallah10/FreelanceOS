import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ background: "oklch(0.10 0.02 250)" }}
        >
            <div className="relative max-w-md w-full text-center">
                {/* Glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-10 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse, #2563EB 0%, transparent 70%)",
                        filter: "blur(40px)",
                    }}
                />

                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-8xl md:text-9xl font-bold tracking-tighter" style={{ color: "#2563EB" }}>
                        404
                    </h1>
                    <div className="absolute -top-4 -right-4 animate-pulse">
                        <Search className="w-6 h-6 text-brand/50" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold mb-2">Page not found</h2>
                <p className="text-white/40 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Back to home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </button>
                </div>

                {/* Help */}
                <p className="text-xs text-white/20 mt-8">
                    Need help? <Link href="/" className="text-brand hover:underline">Contact support</Link>
                </p>
            </div>
        </div>
    );
}