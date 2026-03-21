"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  isLoading?: boolean;
  /** Height of the chart area in pixels. Defaults to 300. */
  chartHeight?: number;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className,
  isLoading = false,
  chartHeight = 300,
}: ChartCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="h-5 w-36 bg-muted rounded-full animate-pulse" />
          {description && (
            <div className="h-3.5 w-52 bg-muted/60 rounded-full animate-pulse mt-1" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className="bg-muted/40 rounded-xl animate-pulse"
            style={{ height: `${chartHeight}px` }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
