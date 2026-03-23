"use client";

import {
  useState,
  // useEffect,
  useCallback,
} from "react";
import type { User } from "@/types";

const DEMO_USER: User = {
  id: "demo_001",
  email: "demo@freelanceos.dev",
  firstName: "Demo",
  lastName: "User",
  currency: "USD",
  avatar:
    "https://ui-avatars.com/api/?name=Demo+User&background=2563EB&color=fff&bold=true",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_SESSION_KEY = "fos_demo_session";

export function useDemoAuth() {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(DEMO_SESSION_KEY);
    return saved === "true";
  });

  const [demoUser, setDemoUser] = useState<User | null>(
    isDemoMode ? DEMO_USER : null,
  );

  const startDemo = useCallback(() => {
    localStorage.setItem(DEMO_SESSION_KEY, "true");
    setIsDemoMode(true);
    setDemoUser(DEMO_USER);
    return true;
  }, []);

  const endDemo = useCallback(() => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    setIsDemoMode(false);
    setDemoUser(null);
  }, []);

  return {
    isDemoMode,
    demoUser,
    startDemo,
    endDemo,
  };
}
