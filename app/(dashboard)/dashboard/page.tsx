"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { StatsCard } from "@/components/stats-card";
import { ChartCard } from "@/components/chart-card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  // getInitials,
} from "@/lib/utils";
import type { ActivityItem, UpcomingDeadline } from "@/types";
import {
  RefreshCw,
  DollarSign,
  Briefcase,
  FileText,
  AlertTriangle,
  // ArrowUpRight,
  CheckCircle2,
  PlusCircle,
  Target,
  UserPlus,
  Send,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ============================================================
// CHART COLORS — defined once, used consistently
// These match our CSS token values for brand/chart colors
// ============================================================
const CHART_COLORS = {
  brand: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  muted: "#64748B",
};

const PIE_COLORS = [
  CHART_COLORS.brand,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.muted,
];

// Revenue distribution — static for now, can be derived from real data later
const REVENUE_DISTRIBUTION = [
  { name: "Active", value: 45 },
  { name: "Completed", value: 30 },
  { name: "Planning", value: 15 },
  { name: "On Hold", value: 10 },
];

// ============================================================
// ACTIVITY ICON MAP
// ============================================================
const activityIconMap: Record<ActivityItem["type"], React.ReactNode> = {
  invoice_paid: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  invoice_sent: <Send className="h-3.5 w-3.5 text-brand" />,
  project_created: <PlusCircle className="h-3.5 w-3.5 text-brand" />,
  project_completed: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  milestone_completed: <Target className="h-3.5 w-3.5 text-warning" />,
  client_added: <UserPlus className="h-3.5 w-3.5 text-brand" />,
  proposal_accepted: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
};

// ============================================================
// DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const {
    stats,
    earningsData,
    recentActivity,
    isLoading,
    errors,
    refresh,
    isAnyLoading,
  } = useDashboard();

  return (
    <div className="space-y-6 p-6 animate-fade-up">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your freelance business at a glance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isAnyLoading}
          className="gap-2 shrink-0"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isAnyLoading && "animate-spin")}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* ---- Stats Grid ---- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(stats?.totalEarnings ?? 0)}
          description="Lifetime earned"
          icon={<DollarSign className="h-4 w-4" />}
          iconColor="brand"
          trend={
            stats
              ? {
                value: stats.earningsGrowth,
                direction: stats.earningsGrowth >= 0 ? "up" : "down",
                label: "vs last month",
              }
              : undefined
          }
          isLoading={isLoading.stats}
        />

        <StatsCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          description={`${stats?.activeProjectsGrowth ?? 0} new this month`}
          icon={<Briefcase className="h-4 w-4" />}
          iconColor="success"
          trend={
            stats
              ? {
                value: stats.activeProjectsGrowth,
                direction: stats.activeProjectsGrowth > 0 ? "up" : "neutral",
                label: "new",
              }
              : undefined
          }
          isLoading={isLoading.stats}
        />

        <StatsCard
          title="Pending Invoices"
          value={stats?.pendingInvoices ?? 0}
          description={
            stats
              ? `${formatCurrency(stats.pendingInvoicesAmount)} outstanding`
              : ""
          }
          icon={<FileText className="h-4 w-4" />}
          iconColor="warning"
          isLoading={isLoading.stats}
        />

        <StatsCard
          title="Overdue"
          value={stats?.overdueInvoices ?? 0}
          description={
            stats?.overdueInvoices
              ? `${formatCurrency(stats.overdueInvoicesAmount)} needs attention`
              : "All invoices on track"
          }
          icon={<AlertTriangle className="h-4 w-4" />}
          iconColor={stats?.overdueInvoices ? "destructive" : "success"}
          isLoading={isLoading.stats}
        />
      </div>

      {/* ---- Charts Row ---- */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Earnings Area Chart — 4/7 width */}
        <ChartCard
          title="Earnings Trend"
          description="Monthly revenue for the last 6 months"
          className="lg:col-span-4"
          isLoading={isLoading.earnings}
          chartHeight={280}
        >
          {errors.earnings ? (
            <ErrorState message={errors.earnings} />
          ) : earningsData.length === 0 ? (
            <EmptyChartState />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={earningsData}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="earningsGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.brand}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.brand}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "currentColor", fontSize: 11 }}
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "currentColor", fontSize: 11 }}
                    className="text-muted-foreground"
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                      formatCurrency(typeof value === "number" ? value : 0),
                      "Earnings",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART_COLORS.brand}
                    strokeWidth={2}
                    fill="url(#earningsGrad)"
                    dot={{ fill: CHART_COLORS.brand, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Revenue Distribution Pie — 3/7 width */}
        <ChartCard
          title="Revenue Distribution"
          description="By project status"
          className="lg:col-span-3"
          isLoading={isLoading.stats}
          chartHeight={280}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_DISTRIBUTION}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {/* BUG FIX: was using earningsData.map() — wrong array.
                      Must use the SAME array as the `data` prop above. */}
                  {REVENUE_DISTRIBUTION.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [
                    `${typeof value === "number" ? value : 0}%`,
                    "",
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ---- Bottom Row ---- */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <ChartCard
          title="Recent Activity"
          description="Latest updates from your business"
          isLoading={isLoading.activity}
        >
          {errors.activity ? (
            <ErrorState message={errors.activity} />
          ) : recentActivity.length === 0 ? (
            <EmptyListState message="No recent activity yet." />
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ChartCard>

        {/* Upcoming Deadlines */}
        <ChartCard
          title="Upcoming Deadlines"
          description="What needs your attention"
          isLoading={isLoading.stats}
        >
          {errors.stats ? (
            <ErrorState message={errors.stats} />
          ) : !stats?.upcomingDeadlines?.length ? (
            <EmptyListState message="No upcoming deadlines. You're all clear!" />
          ) : (
            <div className="space-y-3">
              {stats.upcomingDeadlines.map((deadline) => (
                <DeadlineRow key={deadline.id} deadline={deadline} />
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// Small, focused — each does one thing well.
// ============================================================

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 group">
      {/* Icon circle */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-0.5">
        {activityIconMap[activity.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{activity.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {activity.clientName && (
            <span className="font-medium text-foreground/70">
              {activity.clientName} ·{" "}
            </span>
          )}
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>

      {/* Amount */}
      {activity.amount != null && (
        <span className="shrink-0 text-sm font-mono font-medium text-success">
          +{formatCurrency(activity.amount)}
        </span>
      )}
    </div>
  );
}

function DeadlineRow({ deadline }: { deadline: UpcomingDeadline }) {
  const typeStyles: Record<UpcomingDeadline["type"], string> = {
    project: "bg-brand/10 text-brand",
    invoice: "bg-warning/10 text-warning",
    milestone: "bg-success/10 text-success",
  };

  const typeLabel: Record<UpcomingDeadline["type"], string> = {
    project: "Project",
    invoice: "Invoice",
    milestone: "Milestone",
  };

  return (
    <div className="flex items-start gap-3">
      {/* Badge */}
      <div className="shrink-0 mt-0.5">
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide",
            typeStyles[deadline.type],
          )}
        >
          {typeLabel[deadline.type]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug truncate">
          {deadline.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {deadline.clientName} ·{" "}
          <span
            className={cn(
              deadline.isOverdue ? "text-destructive" : "text-warning",
            )}
          >
            {formatRelativeTime(deadline.date)}
          </span>
        </p>
      </div>

      {/* Amount */}
      {deadline.amount != null && (
        <span className="shrink-0 text-sm font-mono font-medium">
          {formatCurrency(deadline.amount)}
        </span>
      )}
    </div>
  );
}

// ---- Empty & Error States ----

function EmptyChartState() {
  return (
    <div className="h-70 flex flex-col items-center justify-center gap-2 bg-grid-subtle rounded-xl">
      <BarIcon className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">No data yet</p>
      <p className="text-xs text-muted-foreground/70">
        Earnings will appear here once recorded
      </p>
    </div>
  );
}

function EmptyListState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

// Inline icon — avoids importing just for empty state
function BarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}
