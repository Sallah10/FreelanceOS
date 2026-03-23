/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useProjects } from "@/lib/hooks/use-projects";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useClients } from "@/lib/hooks/use-clients";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart3,
    // TrendingUp,
    DollarSign,
    Users,
    Clock,
    AlertTriangle,
} from "lucide-react";
import {
    BarChart,
    Bar,
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

// Chart colors — consistent with dashboard
const CHART_COLORS = {
    brand: "#2563EB",
    success: "#10B981",
    warning: "#F59E0B",
    destructive: "#EF4444",
    purple: "#8B5CF6",
    pink: "#EC4899",
};

const PIE_COLORS = [CHART_COLORS.brand, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.destructive];

export default function AnalyticsPage() {
    const { projects, isLoading: projectsLoading } = useProjects();
    const { invoices, isLoading: invoicesLoading } = useInvoices();
    const { clients, isLoading: clientsLoading } = useClients();

    const isLoading = projectsLoading || invoicesLoading || clientsLoading;

    // 1. Revenue by client (top 5)
    const revenueByClient = useMemo(() => {
        const clientRevenue: Record<string, { name: string; amount: number }> = {};

        invoices.forEach((inv) => {
            if (inv.status === "paid" && inv.client) {
                if (!clientRevenue[inv.clientId]) {
                    clientRevenue[inv.clientId] = { name: inv.client.name, amount: 0 };
                }
                clientRevenue[inv.clientId].amount += inv.amount;
            }
        });

        return Object.values(clientRevenue)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [invoices]);

    // 2. Revenue by currency
    const revenueByCurrency = useMemo(() => {
        const currencyRevenue: Record<string, number> = {};

        invoices.forEach((inv) => {
            if (inv.status === "paid") {
                if (!currencyRevenue[inv.currency]) {
                    currencyRevenue[inv.currency] = 0;
                }
                currencyRevenue[inv.currency] += inv.amount;
            }
        });

        return Object.entries(currencyRevenue).map(([currency, amount]) => ({
            currency,
            amount,
        }));
    }, [invoices]);

    // 3. Invoice aging (how long invoices stay unpaid)
    const invoiceAging = useMemo(() => {
        const now = new Date();
        const aging = {
            "0-30 days": 0,
            "31-60 days": 0,
            "61-90 days": 0,
            "90+ days": 0,
        };

        invoices.forEach((inv) => {
            if (inv.status !== "paid" && inv.status !== "draft") {
                const dueDate = new Date(inv.dueDate);
                const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysOverdue <= 0) {
                    aging["0-30 days"] += inv.amount;
                } else if (daysOverdue <= 30) {
                    aging["0-30 days"] += inv.amount;
                } else if (daysOverdue <= 60) {
                    aging["31-60 days"] += inv.amount;
                } else if (daysOverdue <= 90) {
                    aging["61-90 days"] += inv.amount;
                } else {
                    aging["90+ days"] += inv.amount;
                }
            }
        });

        return Object.entries(aging).map(([range, amount]) => ({
            range,
            amount,
        }));
    }, [invoices]);

    // 4. Project profitability
    const projectProfitability = useMemo(() => {
        return projects.map((project) => {
            const paidInvoices = invoices.filter(
                (inv) => inv.projectId === project.id && inv.status === "paid"
            );
            const earned = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
            const budget = project.budget || 0;
            const profit = earned - budget;
            const profitMargin = budget > 0 ? (profit / budget) * 100 : 0;

            return {
                name: project.name,
                budget,
                earned,
                profit,
                profitMargin,
            };
        }).filter(p => p.earned > 0 || p.budget > 0);
    }, [projects, invoices]);



    // 5. Monthly trends (already in dashboard, but let's add more detail)
    const monthlyTrends = useMemo(() => {
        const monthly: Record<string, { month: string; revenue: number; invoices: number }> = {};

        invoices.forEach((inv) => {
            if (inv.status === "paid") {
                const date = new Date(inv.paidAt || inv.createdAt);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const monthName = date.toLocaleString("default", { month: "short", year: "numeric" });

                if (!monthly[key]) {
                    monthly[key] = { month: monthName, revenue: 0, invoices: 0 };
                }
                monthly[key].revenue += inv.amount;
                monthly[key].invoices += 1;
            }
        });

        return Object.values(monthly).sort((a, b) => {
            // Sort by date (assumes month names are sortable)
            return new Date(a.month).getTime() - new Date(b.month).getTime();
        });
    }, [invoices]);

    // 6. Client acquisition over time
    const clientAcquisition = useMemo(() => {
        const monthly: Record<string, { month: string; count: number }> = {};

        clients.forEach((client) => {
            const date = new Date(client.createdAt);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const monthName = date.toLocaleString("default", { month: "short", year: "numeric" });

            if (!monthly[key]) {
                monthly[key] = { month: monthName, count: 0 };
            }
            monthly[key].count += 1;
        });

        return Object.values(monthly).sort((a, b) => {
            return new Date(a.month).getTime() - new Date(b.month).getTime();
        });
    }, [clients]);

    // 7. Total metrics
    const totalEarned = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.amount, 0);

    const totalPending = invoices
        .filter((i) => i.status === "sent")
        .reduce((sum, i) => sum + i.amount, 0);

    const totalOverdue = invoices
        .filter((i) => i.status === "overdue")
        .reduce((sum, i) => sum + i.amount, 0);

    const paidInvoicesCount = invoices.filter((i) => i.status === "paid").length;
    const totalInvoicesCount = invoices.length;
    const conversionRate = totalInvoicesCount > 0
        ? (paidInvoicesCount / totalInvoicesCount) * 100
        : 0;

    if (isLoading) {
        return <AnalyticsLoadingSkeleton />;
    }

    return (
        <div className="space-y-6 p-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Deep insights into your freelance business performance
                </p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Earned"
                    value={formatCurrency(totalEarned)}
                    icon={<DollarSign className="h-4 w-4" />}
                    trend={conversionRate > 50 ? "up" : "neutral"}
                    trendLabel={`${conversionRate.toFixed(1)}% conversion`}
                />
                <MetricCard
                    title="Pending Revenue"
                    value={formatCurrency(totalPending)}
                    icon={<Clock className="h-4 w-4" />}
                    description="Awaiting payment"
                />
                <MetricCard
                    title="Overdue"
                    value={formatCurrency(totalOverdue)}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    trend={totalOverdue > 0 ? "down" : "neutral"}
                    trendLabel="Needs attention"
                />
                <MetricCard
                    title="Active Clients"
                    value={clients.length}
                    icon={<Users className="h-4 w-4" />}
                    description="Total clients"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Revenue by Client */}
                <ChartCard title="Top Clients by Revenue">
                    {revenueByClient.length === 0 ? (
                        <EmptyChartState message="No paid invoices yet" />
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueByClient} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(value: any) => {
                                            if (typeof value === 'number') return [formatCurrency(value), 'Revenue'];
                                            return [value, 'Revenue'];
                                        }}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                        }}
                                    />
                                    <Bar dataKey="amount" fill={CHART_COLORS.brand} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ChartCard>

                {/* Revenue by Currency */}
                <ChartCard title="Revenue by Currency">
                    {revenueByCurrency.length === 0 ? (
                        <EmptyChartState message="No currency data yet" />
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueByCurrency}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        dataKey="amount"
                                        nameKey="currency"
                                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {revenueByCurrency.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => {
                                            if (typeof value === 'number') return [formatCurrency(value), ''];
                                            return [value, ''];
                                        }}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ChartCard>

                {/* Invoice Aging */}
                <ChartCard title="Invoice Aging">
                    {invoiceAging.every((a) => a.amount === 0) ? (
                        <EmptyChartState message="No outstanding invoices" />
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={invoiceAging}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                    <XAxis dataKey="range" />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                                    <Tooltip
                                        formatter={(value: any) => {
                                            if (typeof value === 'number') {
                                                return [formatCurrency(value), ''];
                                            }
                                            return [value, ''];
                                        }}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                        }}
                                    />
                                    <Bar dataKey="amount" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ChartCard>

                {/* Monthly Revenue Trend */}
                <ChartCard title="Monthly Revenue Trend">
                    {monthlyTrends.length === 0 ? (
                        <EmptyChartState message="No revenue data yet" />
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                                    <Tooltip
                                        formatter={(value: any) => {
                                            if (typeof value === 'number') return [formatCurrency(value), ''];
                                            return [value, ''];
                                        }}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                        }}
                                    />
                                    <Bar dataKey="revenue" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Project Profitability Table */}
            {projectProfitability.length > 0 && (
                <ChartCard title="Project Profitability">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Budget
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Earned
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Profit
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Margin
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectProfitability.map((project) => (
                                    <tr key={project.name} className="border-b border-border/50 hover:bg-muted/30">
                                        <td className="py-3 px-4 text-sm font-medium">{project.name}</td>
                                        <td className="py-3 px-4 text-right text-sm font-mono">{formatCurrency(project.budget)}</td>
                                        <td className="py-3 px-4 text-right text-sm font-mono text-success">{formatCurrency(project.earned)}</td>
                                        <td className={cn(
                                            "py-3 px-4 text-right text-sm font-mono",
                                            project.profit >= 0 ? "text-success" : "text-destructive"
                                        )}>
                                            {project.profit >= 0 ? "+" : ""}{formatCurrency(project.profit)}
                                        </td>
                                        <td className={cn(
                                            "py-3 px-4 text-right text-sm font-mono",
                                            project.profitMargin >= 0 ? "text-success" : "text-destructive"
                                        )}>
                                            {project.profitMargin >= 0 ? "+" : ""}{project.profitMargin.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            )}

            {/* Client Acquisition Over Time */}
            {clientAcquisition.length > 0 && (
                <ChartCard title="Client Acquisition">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clientAcquisition}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: any) => {
                                        if (typeof value === 'number') return [value, 'new clients'];
                                        return [value, ''];
                                    }}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                    }}
                                />
                                <Bar dataKey="count" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────

function MetricCard({
    title,
    value,
    icon,
    description,
    trend,
    trendLabel
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    trend?: "up" | "down" | "neutral";
    trendLabel?: string;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                        <p className="text-2xl font-bold font-mono">{value}</p>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                        {trendLabel && (
                            <p className={cn(
                                "text-xs",
                                trend === "up" && "text-success",
                                trend === "down" && "text-destructive",
                                trend === "neutral" && "text-muted-foreground"
                            )}>
                                {trendLabel}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 rounded-xl p-2.5 bg-brand/10 text-brand">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function EmptyChartState({ message }: { message: string }) {
    return (
        <div className="h-72 flex flex-col items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}

function AnalyticsLoadingSkeleton() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-lg" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-card border border-border rounded-xl" />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                {[1, 2].map((i) => (
                    <div key={i} className="h-80 bg-card border border-border rounded-xl" />
                ))}
            </div>
        </div>
    );
}