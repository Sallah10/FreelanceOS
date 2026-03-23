import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  CurrencyCode,
  InvoiceStatus,
  ProjectStatus,
  MilestoneStatus,
} from "@/types";

// The one and only cn() in this codebase.
// If you need conditional classes anywhere, import from here.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency.
 * Defaults to USD since most African freelancers bill in USD via Raenest.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string for display.
 * Uses en-NG locale by default — shows dates the way Nigerians read them.
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  return new Intl.DateTimeFormat("en-NG", options).format(new Date(date));
}

/**
 * Format a date as relative time (e.g., "3 days ago", "in 5 days")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  // Today check — use absolute diff less than 1 day
  if (Math.abs(diffDays) === 0) return "today";

  // Past dates (negative diffDays)
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays < 7) return rtf.format(diffDays, "day"); // "3 days ago"
    if (absDays < 30) return rtf.format(Math.floor(diffDays / 7), "week"); // "2 weeks ago"
    return rtf.format(Math.floor(diffDays / 30), "month"); // "1 month ago"
  }

  // Future dates (positive diffDays)
  if (diffDays > 0) {
    if (diffDays < 7) return rtf.format(diffDays, "day"); // "in 3 days"
    if (diffDays < 30) return rtf.format(Math.floor(diffDays / 7), "week"); // "in 2 weeks"
    return rtf.format(Math.floor(diffDays / 30), "month"); // "in 1 month"
  }

  return "today";
}

/**
 * Check if a date is overdue (in the past)
 */
export function isOverdue(date: string | Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Get human-readable label + CSS class for invoice status
 */
export function getInvoiceStatusStyle(status: InvoiceStatus): {
  label: string;
  className: string;
} {
  const map: Record<InvoiceStatus, { label: string; className: string }> = {
    paid: { label: "Paid", className: "status-paid" },
    sent: { label: "Sent", className: "status-pending" },
    overdue: { label: "Overdue", className: "status-overdue" },
    draft: { label: "Draft", className: "status-draft" },
  };
  return map[status];
}

/**
 * Get human-readable label + CSS class for project status
 */
export function getProjectStatusStyle(status: ProjectStatus): {
  label: string;
  className: string;
} {
  const map: Record<ProjectStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "status-active" },
    completed: { label: "Completed", className: "status-completed" },
    planning: { label: "Planning", className: "status-planning" },
    on_hold: { label: "On Hold", className: "status-on_hold" },
  };
  return map[status];
}

/**
 * Get human-readable label + CSS class for milestone status
 */
export function getMilestoneStatusStyle(status: MilestoneStatus): {
  label: string;
  className: string;
} {
  const map: Record<MilestoneStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "status-pending" },
    completed: { label: "Completed", className: "status-completed" },
    paid: { label: "Paid", className: "status-paid" },
  };
  return map[status];
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Generate initials from a name (for avatar fallbacks)
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
