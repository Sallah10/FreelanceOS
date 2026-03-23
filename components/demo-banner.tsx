"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";
import { useDemoAuth } from "@/lib/hooks/use-demo-auth";

export function DemoBanner() {
    const [visible, setVisible] = useState(true);
    const { isDemoMode, endDemo } = useDemoAuth();
    const router = useRouter();

    useEffect(() => {
        if (isDemoMode && visible) {
            // Show toast notification on mount
            setTimeout(() => {
                const toastEvent = new CustomEvent("demo-toast");
                window.dispatchEvent(toastEvent);
            }, 500);
        }
    }, [isDemoMode, visible]);

    if (!isDemoMode || !visible) return null;

    const handleSignUp = () => {
        endDemo();
        router.push("/register");
    };

    return (
        <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md rounded-xl shadow-xl"
            style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1e40af 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
            }}
        >
            <div className="flex items-center justify-between p-3 px-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white">Demo Mode</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSignUp}
                        className="text-xs font-semibold text-white hover:text-white/80 transition-colors"
                    >
                        Sign up to save →
                    </button>
                    <button
                        onClick={() => setVisible(false)}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-3 h-3 text-white/70" />
                    </button>
                </div>
            </div>
        </div>
    );
}