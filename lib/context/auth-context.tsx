
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { User, ApiResponse } from "@/types";
import { setSessionCookie, clearSessionCookie } from "@/lib/cookies";
import { useDemoAuth } from "@/lib/hooks/use-demo-auth"

const TOKEN_KEY = "fos_token";

type AuthUser = User

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Mock data ────────────────────────────────────────────────────
const MOCK_USER: AuthUser = {
    id: "u_1",
    email: "demo@freelanceos.dev",
    firstName: "Bello",
    lastName: "Demo",
    currency: "USD",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2025-10-01T00:00:00Z",
};
const MOCK_TOKEN = "mock_jwt_fos_demo";

/** Flip to false when backend is live. Keep in sync with lib/api.ts */
const USE_MOCK = true;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Provider ─────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { isDemoMode, demoUser, endDemo } = useDemoAuth();

    const persistToken = useCallback((t: string) => {
        localStorage.setItem(TOKEN_KEY, t);
        setSessionCookie(t);
        setToken(t);
    }, []);

    const clearToken = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        clearSessionCookie();
        setToken(null);
    }, []);

    // Restore session on page refresh
    useEffect(() => {
        const hydrate = async () => {

            if (isDemoMode) {
                setToken("demo_token");
                setUser(demoUser);
                setIsLoading(false);
                return;
            }

            const saved = localStorage.getItem(TOKEN_KEY);
            if (!saved) { setIsLoading(false); return; }

            if (USE_MOCK) {
                setToken(saved);
                setUser(MOCK_USER);
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await axios.get<ApiResponse<AuthUser>>(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                    { headers: { Authorization: `Bearer ${saved}` } },
                );
                if (data.success && data.data) {
                    setToken(saved);
                    setUser(data.data);
                } else {
                    clearToken();
                }
            } catch {
                clearToken();
            } finally {
                setIsLoading(false);
            }
        };
        hydrate();
    }, [clearToken, isDemoMode, demoUser]);

    const login = useCallback(
        async (creds: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
            if (USE_MOCK) {
                await delay(900);
                persistToken(MOCK_TOKEN);
                setUser(MOCK_USER);
                return { success: true };
            }
            try {
                const { data } = await axios.post<ApiResponse<{ token: string; user: AuthUser }>>(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                    creds,
                );
                if (data.success && data.data) {
                    persistToken(data.data.token);
                    setUser(data.data.user);
                    return { success: true };
                }
                return { success: false, error: data.error ?? "Login failed" };
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    return { success: false, error: err.response?.data?.error ?? "Network error." };
                }
                return { success: false, error: "Something went wrong." };
            }
        },
        [persistToken],
    );

    const register = useCallback(
        async (creds: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
            if (USE_MOCK) {
                await delay(1000);
                persistToken(MOCK_TOKEN);
                setUser({
                    ...MOCK_USER,
                    email: creds.email,
                    firstName: creds.firstName,
                    lastName: creds.lastName,
                });
                return { success: true };
            }
            try {
                const { data } = await axios.post<ApiResponse<{ token: string; user: AuthUser }>>(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                    creds,
                );
                if (data.success && data.data) {
                    persistToken(data.data.token);
                    setUser(data.data.user);
                    return { success: true };
                }
                return { success: false, error: data.error ?? "Registration failed" };
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    return { success: false, error: err.response?.data?.error ?? "Network error." };
                }
                return { success: false, error: "Something went wrong." };
            }
        },
        [persistToken],
    );

    const logout = useCallback(() => {
        if (isDemoMode) {
            endDemo();
        } else {
            clearToken();
        }
        setUser(null);
        router.push("/login");

    }, [clearToken, router, isDemoMode, endDemo]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user, token, isLoading,
            isAuthenticated: !!user && !!token,
            login, register, logout,
        }),
        [user, token, isLoading, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}