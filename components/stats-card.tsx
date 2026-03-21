"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface TrendData {
  value: number;
  direction: "up" | "down" | "neutral";
  label?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: TrendData;
  className?: string;
  isLoading?: boolean;
  /** Optional: tint the icon background with a custom color */
  iconColor?: "brand" | "success" | "warning" | "destructive";
}

const iconColorMap = {
  brand: "bg-brand/10 text-brand",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  isLoading = false,
  iconColor = "brand",
}: StatsCardProps) {
  // Skeleton while loading
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5 flex-1">
              <div className="h-3.5 w-24 bg-muted rounded-full animate-pulse" />
              <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
              <div className="h-3 w-36 bg-muted/60 rounded-full animate-pulse" />
            </div>
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendIcon =
    trend?.direction === "up" ? (
      <ArrowUpRight className="h-3.5 w-3.5" />
    ) : trend?.direction === "down" ? (
      <ArrowDownRight className="h-3.5 w-3.5" />
    ) : (
      <Minus className="h-3.5 w-3.5" />
    );

  const trendClassName = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  }[trend?.direction ?? "neutral"];

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Title */}
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>

            {/* Value + Trend on same line */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-2xl font-bold tracking-tight font-mono tabular-nums">
                {value}
              </h3>

              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    trendClassName,
                  )}
                >
                  {trendIcon}
                  {Math.abs(trend.value)}%
                  {trend.label && (
                    <span className="text-muted-foreground font-normal ml-0.5">
                      {trend.label}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div
              className={cn(
                "shrink-0 rounded-xl p-2.5",
                iconColorMap[iconColor],
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
