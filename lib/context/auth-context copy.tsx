"use client";

/**
 * Auth Context — global user state for the entire app.
 *
 * Pattern: Context + Provider + custom hook (useAuth).
 * This is the standard React pattern for global state without Redux.
 *
 * MOCK PHASE: stores token in a cookie (so middleware can read it)
 *             and user data in memory.
 * REAL PHASE: swap login/register/logout to call the Express API.
 *             The token handling stays identical — just the source changes.
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

// ── Types ──────────────────────────────────────────────────────────

type AuthUser = Omit<User, "createdAt" | "updatedAt">;

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

// ── Context ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Mock data ──────────────────────────────────────────────────────

const MOCK_USER: AuthUser = {
    id: "u_1",
    email: "demo@freelanceos.dev",
    firstName: "Bello",
    lastName: "Demo",
    currency: "USD",
    raenestAccountId: "raenest_mock_123",
};

// Cookie helpers — middleware reads these
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}

// ── Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // On mount: check if token cookie exists and restore user
    useEffect(() => {
        const token = getCookie("fos_token");
        if (token) {
            // MOCK: restore from localStorage backup
            // REAL: call GET /api/v1/auth/me with the token
            const stored = localStorage.getItem("fos_user");
            if (stored) {
                try {
                    setUser(JSON.parse(stored) as AuthUser);
                } catch {
                    deleteCookie("fos_token");
                    localStorage.removeItem("fos_user");
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
            setIsLoading(true);
            try {
                // ── MOCK ──────────────────────────────────────────────────
                await new Promise((r) => setTimeout(r, 800)); // simulate network

                if (
                    credentials.email === "demo@freelanceos.dev" &&
                    credentials.password === "Demo@12345"
                ) {
                    const mockToken = "mock_jwt_token_" + Date.now();
                    setCookie("fos_token", mockToken, 7);
                    localStorage.setItem("fos_user", JSON.stringify(MOCK_USER));
                    localStorage.setItem("fos_token", mockToken); // keep for axios interceptor
                    setUser(MOCK_USER);
                    return { success: true };
                }

                return { success: false, error: "Invalid email or password." };

                // ── REAL (swap when backend is live) ──────────────────────
                // const { data } = await apiClient.post("/auth/login", credentials);
                // if (data.success) {
                //   setCookie("fos_token", data.data.token, 7);
                //   localStorage.setItem("fos_token", data.data.token);
                //   localStorage.setItem("fos_user", JSON.stringify(data.data.user));
                //   setUser(data.data.user);
                //   return { success: true };
                // }
                // return { success: false, error: data.error };
            } catch {
                return { success: false, error: "Network error. Please try again." };
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const register = useCallback(
        async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
            setIsLoading(true);
            try {
                // ── MOCK ──────────────────────────────────────────────────
                await new Promise((r) => setTimeout(r, 1000));

                // Simulate email already taken
                if (credentials.email === "taken@example.com") {
                    return { success: false, error: "An account with this email already exists." };
                }

                const newUser: AuthUser = {
                    id: "u_" + Date.now(),
                    email: credentials.email,
                    firstName: credentials.firstName,
                    lastName: credentials.lastName,
                    currency: "USD",
                };

                const mockToken = "mock_jwt_token_" + Date.now();
                setCookie("fos_token", mockToken, 7);
                localStorage.setItem("fos_token", mockToken);
                localStorage.setItem("fos_user", JSON.stringify(newUser));
                setUser(newUser);
                return { success: true };

                // ── REAL ──────────────────────────────────────────────────
                // const { data } = await apiClient.post("/auth/register", credentials);
                // if (data.success) {
                //   setCookie("fos_token", data.data.token, 7);
                //   localStorage.setItem("fos_token", data.data.token);
                //   localStorage.setItem("fos_user", JSON.stringify(data.data.user));
                //   setUser(data.data.user);
                //   return { success: true };
                // }
                // return { success: false, error: data.error };
            } catch {
                return { success: false, error: "Network error. Please try again." };
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const logout = useCallback(() => {
        deleteCookie("fos_token");
        localStorage.removeItem("fos_token");
        localStorage.removeItem("fos_user");
        setUser(null);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────

/**
 * useAuth — access auth state anywhere in the app.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *
 * Throws if used outside <AuthProvider> — fail fast is better than silent null.
 */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>. Check your layout tree.");
    }
    return ctx;
}