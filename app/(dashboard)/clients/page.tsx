"use client";

import { useState, useMemo } from "react";
import { useClients } from "@/lib/hooks/use-clients";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
    Card, CardContent,
    // CardHeader, 
    // CardTitle 
} from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types";
import {
    Users, Plus, Search, X, Loader2, Mail,
    // Building2, 
    Trash2,
    // ExternalLink,
    Globe,
} from "lucide-react";
// import Image from "next/image";

// ─── Add Client Schema ────────────────────────────────────────────
const addClientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    company: z.string().max(100).optional(),
    country: z.string().max(2).optional(),
    phone: z.string().max(20).optional(),
});
type AddClientFormValues = z.infer<typeof addClientSchema>;

// ─── Add Client Modal ─────────────────────────────────────────────
function AddClientModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (data: AddClientFormValues) => Promise<boolean>;
}) {
    const {
        register, handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AddClientFormValues>({ resolver: zodResolver(addClientSchema) });

    const onSubmit = async (values: AddClientFormValues) => {
        const ok = await onAdd(values);
        if (ok) onClose();
    };

    const inputCls = (err: boolean) =>
        cn(
            "w-full rounded-xl px-3 py-2.5 text-sm transition-colors outline-none",
            "bg-muted/50 border",
            "focus:border-brand focus:bg-background",
            err ? "border-destructive/50" : "border-border hover:border-border/80",
        );

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-semibold">Add new client</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Fill in the details below
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Full name *
                        </label>
                        <input
                            type="text"
                            placeholder="Tunde Adeyemi"
                            {...register("name")}
                            className={inputCls(!!errors.name)}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email *
                        </label>
                        <input
                            type="email"
                            placeholder="tunde@company.com"
                            {...register("email")}
                            className={inputCls(!!errors.email)}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    {/* Company + Country row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Company
                            </label>
                            <input
                                type="text"
                                placeholder="Acme Ltd"
                                {...register("company")}
                                className={inputCls(!!errors.company)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Country
                            </label>
                            <input
                                type="text"
                                placeholder="NG"
                                maxLength={2}
                                {...register("country")}
                                className={inputCls(!!errors.country)}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Phone
                        </label>
                        <input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            {...register("phone")}
                            className={inputCls(false)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2",
                                "py-2.5 rounded-xl text-sm font-semibold text-white",
                                "bg-brand hover:bg-brand/90 transition-colors",
                                "disabled:opacity-60 disabled:cursor-not-allowed",
                            )}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
                            ) : (
                                <><Plus className="w-3.5 h-3.5" /> Add client</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Client Row ───────────────────────────────────────────────────
function ClientRow({
    client,
    onDelete,
}: {
    client: Client;
    onDelete: (id: string) => void;
}) {
    const initials = getInitials(client.name);

    return (
        <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
            {/* Name + avatar */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {client.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={client.avatar}
                            alt={client.name}
                            width={10}
                            height={10}
                            // w-8 h-8 
                            className="w-8 h-8 rounded-full shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-brand">{initials}</span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{client.name}</p>
                        {client.company && (
                            <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                        )}
                    </div>
                </div>
            </td>

            {/* Email */}
            <td className="px-4 py-3">
                <a
                    href={`mailto:${client.email}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{client.email}</span>
                </a>
            </td>

            {/* Country */}
            <td className="px-4 py-3">
                {client.country ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        {client.country}
                    </div>
                ) : (
                    <span className="text-muted-foreground/30 text-sm">—</span>
                )}
            </td>

            {/* Total billed */}
            <td className="px-4 py-3">
                <span className="text-sm font-mono font-medium">
                    {client.totalBilled ? formatCurrency(client.totalBilled) : "—"}
                </span>
            </td>

            {/* Added date */}
            <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                    {formatDate(client.createdAt)}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => onDelete(client.id)}
                        aria-label="Delete client"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function ClientsPage() {
    const { clients, isLoading, error, addClient, deleteClient } = useClients();
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return clients;
        return clients.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.company?.toLowerCase().includes(q),
        );
    }, [clients, search]);

    return (
        <>
            {showModal && (
                <AddClientModal
                    onClose={() => setShowModal(false)}
                    onAdd={addClient}
                />
            )}

            <div className="space-y-6 p-6 animate-fade-up">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {clients.length} client{clients.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add client
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn(
                            "w-full pl-9 pr-4 py-2.5 rounded-xl text-sm",
                            "bg-muted/50 border border-border",
                            "focus:outline-none focus:border-brand focus:bg-background",
                            "placeholder:text-muted-foreground/50 transition-colors",
                        )}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : error ? (
                            <ErrorState message={error} />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                hasSearch={!!search}
                                onAdd={() => setShowModal(true)}
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr
                                            className="border-b border-border text-left"
                                            style={{ background: "var(--muted)" }}
                                        >
                                            {["Client", "Email", "Country", "Total Billed", "Added", ""].map(
                                                (h) => (
                                                    <th
                                                        key={h}
                                                        className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                                    >
                                                        {h}
                                                    </th>
                                                ),
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((client) => (
                                            <ClientRow
                                                key={client.id}
                                                client={client}
                                                onDelete={deleteClient}
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
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-32 bg-muted rounded-full" />
                        <div className="h-3 w-24 bg-muted/60 rounded-full" />
                    </div>
                    <div className="h-3.5 w-40 bg-muted rounded-full" />
                    <div className="h-3.5 w-16 bg-muted rounded-full" />
                    <div className="h-3.5 w-20 bg-muted rounded-full" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({
    hasSearch,
    onAdd,
}: {
    hasSearch: boolean;
    onAdd: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
                {hasSearch ? "No clients match your search" : "No clients yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
                {hasSearch
                    ? "Try a different name, email, or company"
                    : "Add your first client to get started"}
            </p>
            {!hasSearch && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add your first client
                </button>
            )}
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 m-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">{message}</p>
        </div>
    );
}