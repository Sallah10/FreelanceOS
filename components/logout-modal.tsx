"use client";

import { AlertTriangle } from "lucide-react";
import { Portal } from "./ui/portal";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    if (!isOpen) return null;

    return (
        <Portal>

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                }}
                onClick={onClose}
            >

                <div
                    className="w-full max-w-sm rounded-2xl p-6 animate-in fade-in zoom-in duration-200"
                    style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Sign out?</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                You&apos;ll need to sign in again to access your dashboard.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    onConfirm();
                                }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}