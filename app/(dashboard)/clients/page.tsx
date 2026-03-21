"use client";

import { useState, useMemo } from "react";
import { useClients } from "@/lib/hooks/use-clients";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
    Users, Search, Plus,
    RefreshCw,
    //  Mail,
    Building2, Globe,
    //  MoreHorizontal, 
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Client } from "@/types";

// ── Page ──────────────────────────────────────────────────────────

export default function ClientsPage() {
    const { clients, isLoading, error, refresh, totalBilled } = useClients();
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    const filtered = useMemo(
        () =>
            clients.filter(
                (c) =>
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.email.toLowerCase().includes(search.toLowerCase()) ||
                    c.company?.toLowerCase().includes(search.toLowerCase())
            ),
        [clients, search]
    );

    return (
        <div className="space-y-6 p-6 animate-fade-up">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {clients.length} client{clients.length !== 1 ? "s" : ""} · {formatCurrency(totalBilled)} total billed
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading} className="gap-2">
                        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Add client
                    </Button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Total clients", value: clients.length, icon: Users, color: "brand" },
                    { label: "Total billed", value: formatCurrency(totalBilled), icon: TrendingUp, color: "success" },
                    { label: "Avg. per client", value: clients.length ? formatCurrency(totalBilled / clients.length) : "$0", icon: Globe, color: "warning" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                            <div className={cn("rounded-xl p-2.5", {
                                "bg-brand/10 text-brand": s.color === "brand",
                                "bg-success/10 text-success": s.color === "success",
                                "bg-warning/10 text-warning": s.color === "warning",
                            })}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                                <p className="text-xl font-bold font-mono tabular-nums mt-0.5">{s.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by name, email, company…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm outline-none focus:border-brand/50 transition-colors placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Table / content */}
            {error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : isLoading ? (
                <LoadingSkeleton />
            ) : filtered.length === 0 ? (
                <EmptyState
                    hasSearch={!!search}
                    onClear={() => setSearch("")}
                    onAdd={() => setShowAddModal(true)}
                />
            ) : (
                <ClientTable clients={filtered} />
            )}

            {/* Add client modal */}
            {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} onSuccess={refresh} />}
        </div>
    );
}

// ── Client table ──────────────────────────────────────────────────

function ClientTable({ clients }: { clients: Client[] }) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 border-b border-border bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:block">Company</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Billed</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Since</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
                {clients.map((client) => (
                    <ClientRow key={client.id} client={client} />
                ))}
            </div>
        </div>
    );
}

function ClientRow({ client }: { client: Client }) {
    const initials = getInitials(client.name);

    return (
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-muted/20 transition-colors group">
            {/* Avatar + name + email */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: client.avatar ? undefined : "#2563EB" }}
                >
                    {client.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.avatar} alt={client.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                </div>
            </div>

            {/* Company */}
            <div className="hidden md:flex items-center gap-1.5 min-w-0">
                {client.company ? (
                    <>
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{client.company}</span>
                    </>
                ) : (
                    <span className="text-sm text-muted-foreground/40">—</span>
                )}
            </div>

            {/* Billed */}
            <span className="text-sm font-mono font-medium tabular-nums">
                {client.totalBilled ? formatCurrency(client.totalBilled) : "—"}
            </span>

            {/* Date */}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(client.createdAt, { month: "short", year: "numeric" })}
            </span>
        </div>
    );
}

// ── Add client modal ──────────────────────────────────────────────

interface AddClientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function AddClientModal({ onClose, onSuccess }: AddClientModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", company: "", country: "" });
    const [errors, setErrors] = useState<Partial<typeof form>>({});

    const validate = () => {
        const e: Partial<typeof form> = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setIsSubmitting(true);
        // MOCK: simulate API call
        await new Promise((r) => setTimeout(r, 800));
        setIsSubmitting(false);
        toast.success(`${form.name} added as a client`);
        onSuccess();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0 0 0 / 0.6)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-fade-up"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Add new client</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <ModalField label="Full name *" error={errors.name}>
                        <input
                            type="text" placeholder="Tunde Adeyemi"
                            value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="modal-input"
                        />
                    </ModalField>
                    <ModalField label="Email address *" error={errors.email}>
                        <input
                            type="email" placeholder="tunde@company.com"
                            value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="modal-input"
                        />
                    </ModalField>
                    <div className="grid grid-cols-2 gap-3">
                        <ModalField label="Company">
                            <input
                                type="text" placeholder="TechStart Nigeria"
                                value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                                className="modal-input"
                            />
                        </ModalField>
                        <ModalField label="Country">
                            <input
                                type="text" placeholder="NG"
                                value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                                className="modal-input"
                            />
                        </ModalField>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                            {isSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            Add client
                        </Button>
                    </div>
                </form>
            </div>

            {/* Inline styles for modal inputs — avoids Tailwind conflict */}
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
        .modal-input:focus { border-color: var(--primary); }
        .modal-input::placeholder { color: var(--muted-foreground); opacity: 0.5; }
      `}</style>
        </div>
    );
}

function ModalField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

// ── Empty / Loading / Error states ────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-border bg-muted/30 h-10" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-32 bg-muted rounded-full" />
                        <div className="h-3 w-48 bg-muted/60 rounded-full" />
                    </div>
                    <div className="h-4 w-16 bg-muted rounded-full" />
                    <div className="h-3 w-20 bg-muted/60 rounded-full" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasSearch, onClear, onAdd }: { hasSearch: boolean; onClear: () => void; onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-border border-dashed bg-card/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
                <p className="font-medium">{hasSearch ? "No clients found" : "No clients yet"}</p>
                <p className="text-sm text-muted-foreground">
                    {hasSearch ? "Try a different search term" : "Add your first client to get started"}
                </p>
            </div>
            <Button size="sm" onClick={hasSearch ? onClear : onAdd} variant={hasSearch ? "outline" : "default"} className="gap-2">
                {hasSearch ? "Clear search" : <><Plus className="h-3.5 w-3.5" /> Add client</>}
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