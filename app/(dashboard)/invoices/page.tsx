"use client";

import { useState, useMemo } from "react";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useClients } from "@/lib/hooks/use-clients";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn, formatCurrency, formatDate, getInvoiceStatusStyle } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import type { Invoice, InvoiceStatus } from "@/types";
import {
    FileText, Plus, Search, X, Loader2,
    // Copy,
    Trash2,
    // Send, 
    CheckCircle2, Link2,
    // ChevronDown,
    AlertTriangle,
    //  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ─── Zod Schema ───────────────────────────────────────────────────
const invoiceItemSchema = z.object({
    description: z.string().min(1, "Required"),
    quantity: z.number().min(1, "Min 1"),
    rate: z.number().min(0.01, "Min $0.01"),
});

const createInvoiceSchema = z.object({
    clientId: z.string().min(1, "Select a client"),
    dueDate: z.string().min(1, "Due date is required"),
    currency: z.enum(["USD", "NGN", "GBP", "EUR", "KES", "GHS"]),
    notes: z.string().max(500).optional(),
    items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
});

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

// ─── Create Invoice Modal ─────────────────────────────────────────
function CreateInvoiceModal({
    onClose,
    onCreate,
    clients,
}: {
    onClose: () => void;
    onCreate: (data: CreateInvoiceFormValues & { amount: number; items: Invoice["items"] }) => Promise<boolean>;
    clients: { id: string; name: string }[];
}) {
    const {
        register, handleSubmit, control,
        formState: { errors, isSubmitting },
    } = useForm<CreateInvoiceFormValues>({
        resolver: zodResolver(createInvoiceSchema),
        defaultValues: {
            currency: "USD",
            items: [{ description: "", quantity: 1, rate: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems = useWatch({
        control,
        name: "items",
        defaultValue: [{ description: "", quantity: 1, rate: 0 }],
    });

    // Live total calculation
    const total = watchedItems?.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
        0,
    ) ?? 0;

    const onSubmit = async (values: CreateInvoiceFormValues) => {
        const items = values.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            amount: Number(item.quantity) * Number(item.rate),
        }));
        const ok = await onCreate({ ...values, amount: total, items });
        if (ok) onClose();
    };

    const inputCls = (err?: boolean) =>
        cn(
            "w-full rounded-xl px-3 py-2.5 text-sm transition-colors outline-none",
            "bg-muted/50 border",
            "focus:border-brand focus:bg-background",
            err ? "border-destructive/50" : "border-border",
        );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-lg rounded-2xl p-6 my-4"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-semibold">Create invoice</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            A Raenest payment link will be auto-generated
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* Client + Due date row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Client *
                            </label>
                            <select
                                {...register("clientId")}
                                className={cn(inputCls(!!errors.clientId), "cursor-pointer")}
                            >
                                <option value="">Select client</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.clientId && (
                                <p className="text-xs text-destructive">{errors.clientId.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Due date *
                            </label>
                            <input
                                type="date"
                                {...register("dueDate")}
                                className={inputCls(!!errors.dueDate)}
                                min={new Date().toISOString().split("T")[0]}
                            />
                            {errors.dueDate && (
                                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Currency */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Currency
                        </label>
                        <select {...register("currency")} className={cn(inputCls(), "cursor-pointer")}>
                            {["USD", "GBP", "EUR", "NGN", "KES", "GHS"].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Line items *
                            </label>
                            {errors.items?.root && (
                                <p className="text-xs text-destructive">{errors.items.root.message}</p>
                            )}
                        </div>

                        {/* Column headers */}
                        <div className="grid grid-cols-12 gap-2 px-1">
                            <span className="col-span-6 text-[10px] text-muted-foreground uppercase tracking-wider">Description</span>
                            <span className="col-span-2 text-[10px] text-muted-foreground uppercase tracking-wider">Qty</span>
                            <span className="col-span-3 text-[10px] text-muted-foreground uppercase tracking-wider">Rate</span>
                            <span className="col-span-1" />
                        </div>

                        {fields.map((field, idx) => (
                            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        placeholder="e.g. UI Design"
                                        {...register(`items.${idx}.description`)}
                                        className={inputCls(!!errors.items?.[idx]?.description)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="1"
                                        {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                                        className={inputCls(!!errors.items?.[idx]?.quantity)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register(`items.${idx}.rate`, { valueAsNumber: true })}
                                        className={inputCls(!!errors.items?.[idx]?.rate)}
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center pt-2.5">
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(idx)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => append({ description: "", quantity: 1, rate: 0 })}
                            className="text-xs text-brand hover:text-brand/80 flex items-center gap-1 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                            Add line item
                        </button>
                    </div>

                    {/* Total */}
                    <div
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: "var(--muted)" }}
                    >
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-lg font-bold font-mono">{formatCurrency(total)}</span>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Notes (optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Payment terms, bank details, thank you note..."
                            {...register("notes")}
                            className={cn(inputCls(), "resize-none")}
                        />
                    </div>

                    {/* Raenest hint */}
                    <div
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
                        style={{
                            background: "var(--brand-muted)",
                            border: "1px solid var(--brand)/20",
                            color: "var(--brand)",
                        }}
                    >
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        A Raenest payment link will be auto-attached to this invoice
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || total === 0}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2",
                                "py-2.5 rounded-xl text-sm font-semibold text-white",
                                "bg-brand hover:bg-brand/90 transition-colors",
                                "disabled:opacity-60 disabled:cursor-not-allowed",
                            )}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                            ) : (
                                <><FileText className="w-3.5 h-3.5" /> Create invoice</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Invoice Row ──────────────────────────────────────────────────
function InvoiceRow({
    invoice,
    onCopyLink,
    onUpdateStatus,
    onDelete,
}: {
    invoice: Invoice;
    onCopyLink: (link: string) => void;
    onUpdateStatus: (id: string, status: InvoiceStatus) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
}) {
    const { label, className } = getInvoiceStatusStyle(invoice.status);
    const [updating, setUpdating] = useState(false);

    const handleMarkPaid = async () => {
        setUpdating(true);
        await onUpdateStatus(invoice.id, "paid");
        setUpdating(false);
    };

    return (
        <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
            {/* Number */}
            <td className="px-4 py-3">
                <Link
                    href={`/invoices/${invoice.id}`}
                    className="text-sm font-mono font-semibold hover:text-brand transition-colors"
                >
                    {invoice.number}
                </Link>
            </td>

            {/* Client */}
            <td className="px-4 py-3">
                <span className="text-sm">{invoice.client?.name ?? "—"}</span>
            </td>

            {/* Amount */}
            <td className="px-4 py-3">
                <span className="text-sm font-mono font-semibold">
                    {formatCurrency(invoice.amount, invoice.currency)}
                </span>
            </td>

            {/* Status */}
            <td className="px-4 py-3">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", className)}>
                    {label}
                </span>
            </td>

            {/* Due date */}
            <td className="px-4 py-3">
                <span
                    className={cn(
                        "text-sm",
                        invoice.status === "overdue" ? "text-destructive font-medium" : "text-muted-foreground",
                    )}
                >
                    {formatDate(invoice.dueDate)}
                </span>
            </td>

            {/* Raenest link */}
            <td className="px-4 py-3">
                {invoice.paymentLink ? (
                    <button
                        onClick={() => onCopyLink(invoice.paymentLink!)}
                        className="flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 transition-colors"
                    >
                        <Link2 className="w-3 h-3" />
                        Copy link
                    </button>
                ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                )}
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {invoice.status !== "paid" && (
                        <button
                            onClick={handleMarkPaid}
                            disabled={updating}
                            className="p-1.5 rounded-lg hover:bg-success/10 text-muted-foreground hover:text-success transition-colors"
                            title="Mark as paid"
                        >
                            {updating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(invoice.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete invoice"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Status filter tabs ───────────────────────────────────────────
const STATUS_FILTERS: { label: string; value: InvoiceStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
];

// ─── Page ─────────────────────────────────────────────────────────
export default function InvoicesPage() {
    const { invoices, isLoading, error, createInvoice, updateStatus, deleteInvoice } = useInvoices();
    const { clients } = useClients();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
    const [showModal, setShowModal] = useState(false);

    const filtered = useMemo(() => {
        return invoices.filter((inv) => {
            const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
            const q = search.toLowerCase().trim();

            const clientName = inv.client?.name ?? "";
            const matchesSearch =
                !q ||
                inv.number.toLowerCase().includes(q) ||
                clientName.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [invoices, statusFilter, search]);

    // Summary stats for header
    const totalPaid = invoices
        .filter((i) => i.status === "paid")
        .reduce((s, i) => s + i.amount, 0);
    const totalPending = invoices
        .filter((i) => i.status === "sent")
        .reduce((s, i) => s + i.amount, 0);
    const totalOverdue = invoices
        .filter((i) => i.status === "overdue")
        .reduce((s, i) => s + i.amount, 0);


    const copyPaymentLink = (link: string) => {

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(link);
                toast.success("Payment link copied!", {
                    description: "Share this Raenest link with your client.",
                });
            } catch (err) {
                // Fallback for older browsers or non-HTTPS
                console.warn("Clipboard API failed, falling back to textarea method", err);
                const textarea = document.createElement("textarea");
                textarea.value = link;
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand("copy");
                document.body.removeChild(textarea);
                if (success) {
                    toast.success("Payment link copied!", {
                        description: "Share this Raenest link with your client.",
                    });
                } else {
                    toast.error("Failed to copy", {
                        description: "Please manually copy the link.",
                    });
                }
            }
        };
        copyToClipboard();
    };

    const handleCreate = async (
        data: z.infer<typeof createInvoiceSchema> & { amount: number; items: Invoice["items"] },
    ) => {
        const client = clients.find((c) => c.id === data.clientId);
        return createInvoice({
            clientId: data.clientId,
            client,
            number: "",
            amount: data.amount,
            currency: data.currency,
            status: "draft",
            issueDate: new Date().toISOString(),
            dueDate: new Date(data.dueDate).toISOString(),
            items: data.items,
            notes: data.notes,
        });
    };

    return (
        <>
            {showModal && (
                <CreateInvoiceModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                    clients={clients.map((c) => ({ id: c.id, name: c.name }))}
                />
            )}

            <div className="space-y-6 p-6 animate-fade-up">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        New invoice
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Total paid", amount: totalPaid, color: "text-success" },
                        { label: "Pending", amount: totalPending, color: "text-warning" },
                        { label: "Overdue", amount: totalOverdue, color: "text-destructive" },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                                <p className={cn("text-xl font-bold font-mono", s.color)}>
                                    {formatCurrency(s.amount)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                    statusFilter === f.value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {f.label}
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                    {f.value === "all"
                                        ? invoices.length
                                        : invoices.filter((i) => i.status === f.value).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by number or client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn(
                                "w-full pl-9 pr-4 py-2 rounded-xl text-sm",
                                "bg-muted/50 border border-border",
                                "focus:outline-none focus:border-brand focus:bg-background",
                                "placeholder:text-muted-foreground/50 transition-colors",
                            )}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : error ? (
                            <ErrorState message={error} />
                        ) : filtered.length === 0 ? (
                            <EmptyState hasSearch={!!search || statusFilter !== "all"} onAdd={() => setShowModal(true)} />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border text-left" style={{ background: "var(--muted)" }}>
                                            {["Invoice #", "Client", "Amount", "Status", "Due Date", "Payment Link", ""].map((h) => (
                                                <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((invoice) => (
                                            <InvoiceRow
                                                key={invoice.id}
                                                invoice={invoice}
                                                onCopyLink={copyPaymentLink}
                                                onUpdateStatus={updateStatus}
                                                onDelete={deleteInvoice}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                    <div className="h-3.5 w-28 bg-muted rounded-full" />
                    <div className="h-3.5 w-32 bg-muted rounded-full" />
                    <div className="h-3.5 w-20 bg-muted rounded-full" />
                    <div className="h-5 w-16 bg-muted rounded-lg" />
                    <div className="h-3.5 w-24 bg-muted rounded-full" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
                {hasSearch ? "No invoices match your filter" : "No invoices yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
                {hasSearch ? "Try changing the filter or search term" : "Create your first invoice and get paid via Raenest"}
            </p>
            {!hasSearch && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create first invoice
                </button>
            )}
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 m-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{message}</p>
        </div>
    );
}