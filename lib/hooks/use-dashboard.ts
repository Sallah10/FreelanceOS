"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardAPI } from "@/lib/api";
import type { DashboardStats, EarningsDataPoint, ActivityItem } from "@/types";

interface DashboardLoadingState {
  stats: boolean;
  earnings: boolean;
  activity: boolean;
}

interface DashboardErrorState {
  stats: string | null;
  earnings: string | null;
  activity: string | null;
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  earningsData: EarningsDataPoint[];
  recentActivity: ActivityItem[];
  isLoading: DashboardLoadingState;
  errors: DashboardErrorState;
  refresh: () => Promise<void>;
  isAnyLoading: boolean;
}

const INITIAL_LOADING: DashboardLoadingState = {
  stats: true,
  earnings: true,
  activity: true,
};

const INITIAL_ERRORS: DashboardErrorState = {
  stats: null,
  earnings: null,
  activity: null,
};

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] =
    useState<DashboardLoadingState>(INITIAL_LOADING);
  const [errors, setErrors] = useState<DashboardErrorState>(INITIAL_ERRORS);

  const fetchAll = useCallback(async () => {
    setIsLoading(INITIAL_LOADING);
    setErrors(INITIAL_ERRORS);

    const [statsResult, earningsResult, activityResult] =
      await Promise.allSettled([
        DashboardAPI.getStats(),
        DashboardAPI.getEarningsOverTime(),
        DashboardAPI.getRecentActivity(),
      ]);

    // Process stats
    if (
      statsResult.status === "fulfilled" &&
      statsResult.value.success &&
      statsResult.value.data
    ) {
      setStats(statsResult.value.data);
    } else {
      const errMsg =
        statsResult.status === "rejected"
          ? "Network error loading stats"
          : (statsResult.value.error ?? "Failed to load stats");
      setErrors((prev) => ({ ...prev, stats: errMsg }));
    }

    // Process earnings
    if (
      earningsResult.status === "fulfilled" &&
      earningsResult.value.success &&
      earningsResult.value.data
    ) {
      setEarningsData(earningsResult.value.data);
    } else {
      const errMsg =
        earningsResult.status === "rejected"
          ? "Network error loading earnings"
          : (earningsResult.value.error ?? "Failed to load earnings");
      setErrors((prev) => ({ ...prev, earnings: errMsg }));
    }

    // Process activity
    if (
      activityResult.status === "fulfilled" &&
      activityResult.value.success &&
      activityResult.value.data
    ) {
      setRecentActivity(activityResult.value.data);
    } else {
      const errMsg =
        activityResult.status === "rejected"
          ? "Network error loading activity"
          : (activityResult.value.error ?? "Failed to load activity");
      setErrors((prev) => ({ ...prev, activity: errMsg }));
    }

    setIsLoading({ stats: false, earnings: false, activity: false });
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchAll();
    };
    init();
  }, [fetchAll]);

  // Derived state - handy for disabling refresh button, showing global spinner
  const isAnyLoading = Object.values(isLoading).some(Boolean);

  return {
    stats,
    earningsData,
    recentActivity,
    isLoading,
    errors,
    refresh: fetchAll,
    isAnyLoading,
  };
}
