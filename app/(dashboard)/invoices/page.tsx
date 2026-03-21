"use client";

import { useState, useMemo } from "react";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types";
import {
    FileText, Plus, RefreshCw, Search, Copy,
    ExternalLink, CheckCircle2, Clock, AlertTriangle,
    DollarSign, Send,
    //  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Status config ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    InvoiceStatus,
    { label: string; icon: React.ElementType; className: string }
> = {
    paid: { label: "Paid", icon: CheckCircle2, className: "status-paid" },
    sent: { label: "Sent", icon: Send, className: "status-pending" },
    overdue: { label: "Overdue", icon: AlertTriangle, className: "status-overdue" },
    draft: { label: "Draft", icon: FileText, className: "status-draft" },
};

const FILTER_TABS: Array<{ key: InvoiceStatus | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "sent", label: "Sent" },
    { key: "paid", label: "Paid" },
    { key: "overdue", label: "Overdue" },
    { key: "draft", label: "Draft" },
];

// ── Page ──────────────────────────────────────────────────────────

export default function InvoicesPage() {
    const { invoices, isLoading, error, refresh, totals, filterByStatus } = useInvoices();
    const [activeFilter, setActiveFilter] = useState<InvoiceStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const displayed = useMemo(() => {
        const byStatus = filterByStatus(activeFilter);
        if (!search) return byStatus;
        const q = search.toLowerCase();
        return byStatus.filter(
            (inv) =>
                inv.number.toLowerCase().includes(q) ||
                inv.client?.name.toLowerCase().includes(q) ||
                inv.project?.name.toLowerCase().includes(q)
        );
    }, [filterByStatus, activeFilter, search]);

    return (
        <div className="space-y-6 p-6 animate-fade-up">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} · {formatCurrency(totals.paid)} collected
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading} className="gap-2">
                        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        New invoice
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total invoiced", value: formatCurrency(totals.all), color: "brand", icon: DollarSign },
                    { label: "Collected", value: formatCurrency(totals.paid), color: "success", icon: CheckCircle2 },
                    { label: "Awaiting payment", value: formatCurrency(totals.pending), color: "warning", icon: Clock },
                    { label: "Overdue", value: formatCurrency(totals.overdue), color: totals.overdue > 0 ? "destructive" : "muted", icon: AlertTriangle },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                            <div className={cn("rounded-lg p-2 shrink-0", {
                                "bg-brand/10 text-brand": s.color === "brand",
                                "bg-success/10 text-success": s.color === "success",
                                "bg-warning/10 text-warning": s.color === "warning",
                                "bg-destructive/10 text-destructive": s.color === "destructive",
                                "bg-muted text-muted-foreground": s.color === "muted",
                            })}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                                <p className="text-lg font-bold font-mono tabular-nums truncate mt-0.5">{s.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters + search */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Status tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                activeFilter === tab.key
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                            {tab.key !== "all" && (
                                <span className="ml-1.5 text-[10px] opacity-60">
                                    {filterByStatus(tab.key as InvoiceStatus).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search invoices…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:border-brand/50 transition-colors placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Content */}
            {error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : isLoading ? (
                <InvoicesSkeleton />
            ) : displayed.length === 0 ? (
                <EmptyState hasFilter={activeFilter !== "all" || !!search} onReset={() => { setActiveFilter("all"); setSearch(""); }} onNew={() => setShowCreateModal(true)} />
            ) : (
                <InvoiceTable invoices={displayed} />
            )}

            {showCreateModal && (
                <CreateInvoiceModal onClose={() => setShowCreateModal(false)} onSuccess={refresh} />
            )}
        </div>
    );
}

// ── Invoice table ─────────────────────────────────────────────────

function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span className="w-28">Invoice</span>
                <span>Client</span>
                <span>Due date</span>
                <span>Amount</span>
                <span>Status</span>
            </div>
            <div className="divide-y divide-border">
                {invoices.map((inv) => (
                    <InvoiceRow key={inv.id} invoice={inv} />
                ))}
            </div>
        </div>
    );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
    const status = STATUS_CONFIG[invoice.status];
    const StatusIcon = status.icon;
    const initials = invoice.client ? getInitials(invoice.client.name) : "??";

    const copyPaymentLink = () => {
        if (!invoice.paymentLink) {
            toast.error("No payment link — send the invoice first");
            return;
        }
        navigator.clipboard.writeText(invoice.paymentLink);
        toast.success("Payment link copied!");
    };

    return (
        <div className="grid md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-4 items-center hover:bg-muted/20 transition-colors group">
            {/* Invoice number */}
            <div className="w-28">
                <span className="text-xs font-mono font-medium text-muted-foreground">{invoice.number}</span>
            </div>

            {/* Client */}
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{invoice.client?.name ?? "Unknown"}</p>
                    {invoice.project && (
                        <p className="text-xs text-muted-foreground truncate">{invoice.project.name}</p>
                    )}
                </div>
            </div>

            {/* Due date */}
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:block">
                {formatDate(invoice.dueDate, { month: "short", day: "numeric", year: "numeric" })}
            </span>

            {/* Amount */}
            <span className="text-sm font-mono font-semibold tabular-nums">
                {formatCurrency(invoice.amount, invoice.currency)}
            </span>

            {/* Status + actions */}
            <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", status.className)}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {status.label}
                </span>

                {/* Copy payment link — only shown for sent invoices */}
                {invoice.paymentLink && invoice.status === "sent" && (
                    <button
                        onClick={copyPaymentLink}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Copy Raenest payment link"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Create invoice modal ──────────────────────────────────────────

function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        clientName: "",
        projectName: "",
        amount: "",
        currency: "USD",
        dueDate: "",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.clientName || !form.amount || !form.dueDate) {
            toast.error("Fill in client, amount, and due date");
            return;
        }

        setIsSubmitting(true);
        // MOCK — simulate create + Raenest link generation
        await new Promise((r) => setTimeout(r, 1000));

        const mockLink = `https://pay.raenest.com/inv-${Date.now()}`;
        setIsSubmitting(false);

        toast.success(
            <div className="space-y-1">
                <p className="font-medium">Invoice created!</p>
                <p className="text-xs opacity-70">Raenest payment link generated</p>
                <button
                    onClick={() => { navigator.clipboard.writeText(mockLink); toast.success("Link copied!"); }}
                    className="flex items-center gap-1 text-xs underline mt-1"
                >
                    <Copy className="h-2.5 w-2.5" /> Copy payment link
                </button>
            </div>,
            { duration: 6000 }
        );

        onSuccess();
        onClose();
    };

    const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0 0 0 / 0.6)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-lg rounded-2xl p-6 space-y-5 animate-fade-up max-h-[90vh] overflow-y-auto"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Create invoice</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">A Raenest payment link will be generated automatically</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Client */}
                    <ModalField label="Client *">
                        <input type="text" placeholder="TechStart Nigeria" value={form.clientName} onChange={f("clientName")} className="modal-input" />
                    </ModalField>

                    {/* Project */}
                    <ModalField label="Project (optional)">
                        <input type="text" placeholder="E-commerce Redesign" value={form.projectName} onChange={f("projectName")} className="modal-input" />
                    </ModalField>

                    {/* Amount + currency */}
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                        <ModalField label="Amount *">
                            <input type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={f("amount")} className="modal-input" />
                        </ModalField>
                        <ModalField label="Currency">
                            <select value={form.currency} onChange={f("currency")} className="modal-input">
                                {["USD", "GBP", "EUR", "NGN", "KES", "GHS"].map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </ModalField>
                    </div>

                    {/* Due date */}
                    <ModalField label="Due date *">
                        <input type="date" value={form.dueDate} onChange={f("dueDate")} min={new Date().toISOString().split("T")[0]} className="modal-input" />
                    </ModalField>

                    {/* Notes */}
                    <ModalField label="Notes">
                        <textarea
                            placeholder="Payment terms, bank details, any extra info…"
                            value={form.notes}
                            onChange={f("notes")}
                            rows={3}
                            className="modal-input resize-none"
                        />
                    </ModalField>

                    {/* Raenest callout */}
                    <div
                        className="flex items-start gap-3 rounded-xl p-3 text-xs"
                        style={{ background: "var(--brand-muted)", border: "1px solid var(--ring)" }}
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-brand mt-0.5 shrink-0" />
                        <p className="text-muted-foreground leading-relaxed">
                            A <span className="font-semibold text-foreground">Raenest payment link</span> will be
                            attached to this invoice. Your client can pay from any country. You receive in your chosen currency.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                            {isSubmitting ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <><DollarSign className="h-3.5 w-3.5" /> Create &amp; generate link</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <style>{`
        .modal-input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid var(--border);
          background: var(--muted);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s;
        }
        .modal-input:focus { border-color: var(--ring); }
        .modal-input::placeholder { color: var(--muted-foreground); opacity: 0.5; }
        .modal-input option { background: var(--card); }
      `}</style>
        </div>
    );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">{label}</label>
            {children}
        </div>
    );
}

// ── States ────────────────────────────────────────────────────────

function InvoicesSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
            <div className="h-10 bg-muted/30 border-b border-border" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
                    <div className="w-24 h-3 bg-muted rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-32 bg-muted rounded-full" />
                        <div className="h-3 w-24 bg-muted/60 rounded-full" />
                    </div>
                    <div className="h-3 w-20 bg-muted/60 rounded-full" />
                    <div className="h-4 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-14 bg-muted rounded-full" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasFilter, onReset, onNew }: { hasFilter: boolean; onReset: () => void; onNew: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-border border-dashed bg-card/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
                <p className="font-medium">{hasFilter ? "No invoices match this filter" : "No invoices yet"}</p>
                <p className="text-sm text-muted-foreground">
                    {hasFilter ? "Try a different status filter" : "Create your first invoice and get paid via Raenest"}
                </p>
            </div>
            <Button size="sm" onClick={hasFilter ? onReset : onNew} variant={hasFilter ? "outline" : "default"} className="gap-2">
                {hasFilter ? "Clear filters" : <><Plus className="h-3.5 w-3.5" /> Create invoice</>}
            </Button>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-destructive">{message}</p>
            <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>
        </div>
    );
}