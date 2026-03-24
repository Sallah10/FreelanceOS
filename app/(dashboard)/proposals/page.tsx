"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/lib/hooks/use-clients";
import { ProposalsAPI } from "@/lib/api";
import type { Proposal, ProposalStatus } from "@/types";
import {
    FileCheck,
    Plus,
    Search,
    X,
    Loader2,
    Trash2,
    Send,
    CheckCircle2,
    XCircle,
    // Eye,
    AlertTriangle,
    FileText,
} from "lucide-react";

// ─── Zod Schema ───────────────────────────────────────────────────
const createProposalSchema = z.object({
    clientId: z.string().min(1, "Select a client"),
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    content: z.string().min(10, "Description must be at least 10 characters").max(5000),
    amount: z.number().min(1, "Amount must be greater than 0"),
    currency: z.enum(["USD", "NGN", "GBP", "EUR", "KES", "GHS"]),
    validUntil: z.string().optional(),
});

type CreateProposalFormValues = z.infer<typeof createProposalSchema>;

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProposalStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    sent: { label: "Sent", className: "bg-warning/10 text-warning" },
    accepted: { label: "Accepted", className: "bg-success/10 text-success" },
    rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
};

// const STATUS_OPTIONS: ProposalStatus[] = ["draft", "sent", "accepted", "rejected"];

// ─── Create Proposal Modal ────────────────────────────────────────
function CreateProposalModal({
    onClose,
    onCreate,
    clients,
}: {
    onClose: () => void;
    onCreate: (data: CreateProposalFormValues) => Promise<boolean>;
    clients: { id: string; name: string }[];
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateProposalFormValues>({
        resolver: zodResolver(createProposalSchema),
        defaultValues: {
            currency: "USD",
            title: "",
            content: "",
            amount: 0,
            clientId: "",
            validUntil: "",
        },
    });

    const onSubmit = async (values: CreateProposalFormValues) => {
        const ok = await onCreate(values);
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
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-semibold">New Proposal</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Create a proposal to send to your client
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
                    {/* Client */}
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
                        {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Proposal Title *
                        </label>
                        <input
                            type="text"
                            placeholder="Website Redesign Proposal"
                            {...register("title")}
                            className={inputCls(!!errors.title)}
                        />
                        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                    </div>

                    {/* Description/Content */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Description *
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe the scope of work, deliverables, timeline..."
                            {...register("content")}
                            className={cn(inputCls(!!errors.content), "resize-none")}
                        />
                        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                    </div>

                    {/* Amount + Currency row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Amount *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="100"
                                placeholder="5000"
                                {...register("amount", { valueAsNumber: true })}
                                className={inputCls(!!errors.amount)}
                            />
                            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Currency
                            </label>
                            <select {...register("currency")} className={cn(inputCls(), "cursor-pointer")}>
                                {["USD", "GBP", "EUR", "NGN", "KES", "GHS"].map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Valid Until */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Valid Until (optional)
                        </label>
                        <input
                            type="date"
                            {...register("validUntil")}
                            className={inputCls()}
                            min={new Date().toISOString().split("T")[0]}
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
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                            ) : (
                                <><FileCheck className="w-3.5 h-3.5" /> Create proposal</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Proposal Card ─────────────────────────────────────────────────
function ProposalCard({
    proposal,
    onStatusChange,
    onDelete,
}: {
    proposal: Proposal;
    onStatusChange: (id: string, status: ProposalStatus) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
}) {
    const [updating, setUpdating] = useState(false);
    const { label, className } = STATUS_CONFIG[proposal.status];

    const handleStatusChange = async (status: ProposalStatus) => {
        setUpdating(true);
        await onStatusChange(proposal.id, status);
        setUpdating(false);
    };

    const initials = proposal.client ? getInitials(proposal.client.name) : "?";

    return (
        <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="p-4 space-y-3">
                {/* Header: status + actions */}
                <div className="flex items-start justify-between gap-2">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", className)}>
                        {label}
                    </span>
                    <button
                        onClick={() => onDelete(proposal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-sm font-semibold leading-snug">{proposal.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {proposal.content}
                    </p>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1.5 text-sm font-mono font-semibold">
                    {formatCurrency(proposal.amount, proposal.currency)}
                </div>

                {/* Footer: client + valid until */}
                <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-brand">{initials}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-25">
                            {proposal.client?.name ?? "No client"}
                        </span>
                    </div>
                    {proposal.validUntil && (
                        <span className="text-xs text-muted-foreground">
                            Valid until {formatDate(proposal.validUntil)}
                        </span>
                    )}
                </div>

                {/* Action buttons (for draft/sent) */}
                {proposal.status === "draft" && (
                    <button
                        onClick={() => handleStatusChange("sent")}
                        disabled={updating}
                        className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 rounded-lg text-xs font-medium bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                    >
                        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Send to client
                    </button>
                )}

                {proposal.status === "sent" && (
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => handleStatusChange("accepted")}
                            disabled={updating}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Accept
                        </button>
                        <button
                            onClick={() => handleStatusChange("rejected")}
                            disabled={updating}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                            <XCircle className="w-3 h-3" />
                            Reject
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function ProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all");

    const { clients } = useClients();

    // Fetch proposals
    const fetchProposals = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await ProposalsAPI.getProposals();
            if (res.success && res.data) {
                setProposals(Array.isArray(res.data) ? res.data : []);
            } else {
                setError(res.error ?? "Failed to load proposals");
                setProposals([]);
            }
        } catch {
            setError("Network error loading proposals");
            setProposals([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create proposal
    const createProposal = useCallback(async (data: CreateProposalFormValues): Promise<boolean> => {
        try {
            const client = clients.find((c) => c.id === data.clientId);
            const newProposal: Omit<Proposal, "id" | "userId" | "createdAt" | "updatedAt"> = {
                clientId: data.clientId,
                client,
                title: data.title,
                content: data.content,
                amount: data.amount,
                currency: data.currency,
                status: "draft",
                validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
            };

            const res = await ProposalsAPI.createProposal(newProposal);
            if (res.success && res.data) {
                setProposals((prev) => [res.data as Proposal, ...prev]);
                toast.success("Proposal created", {
                    description: `"${data.title}" is ready to send.`,
                });
                return true;
            }
            toast.error("Failed to create proposal", { description: res.error });
            return false;
        } catch {
            toast.error("Network error");
            return false;
        }
    }, [clients]);

    // Update status
    const updateStatus = useCallback(async (id: string, status: ProposalStatus): Promise<boolean> => {
        try {
            const res = await ProposalsAPI.updateProposal(id, { status });
            if (res.success && res.data) {
                setProposals((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, status } : p))
                );
                toast.success(`Proposal ${status}`);
                return true;
            }
            return false;
        } catch {
            toast.error("Failed to update proposal");
            return false;
        }
    }, []);

    // Delete proposal
    const deleteProposal = useCallback(async (id: string): Promise<boolean> => {
        try {
            const res = await ProposalsAPI.deleteProposal(id);
            if (res.success) {
                setProposals((prev) => prev.filter((p) => p.id !== id));
                toast.success("Proposal deleted");
                return true;
            }
            return false;
        } catch {
            toast.error("Failed to delete proposal");
            return false;
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);


    // Filtered proposals
    const filtered = useMemo(() => {
        let result = proposals;

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((p) => p.status === statusFilter);
        }

        // Search filter
        const q = search.toLowerCase().trim();
        if (q) {
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.client?.name.toLowerCase().includes(q) ||
                    p.content.toLowerCase().includes(q)
            );
        }

        return result;
    }, [proposals, statusFilter, search]);

    const STATUS_FILTERS: { label: string; value: ProposalStatus | "all" }[] = [
        { label: "All", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
    ];

    const counts = useMemo(() => {
        return {
            all: proposals.length,
            draft: proposals.filter((p) => p.status === "draft").length,
            sent: proposals.filter((p) => p.status === "sent").length,
            accepted: proposals.filter((p) => p.status === "accepted").length,
            rejected: proposals.filter((p) => p.status === "rejected").length,
        };
    }, [proposals]);

    return (
        <>
            {showModal && (
                <CreateProposalModal
                    onClose={() => setShowModal(false)}
                    onCreate={createProposal}
                    clients={clients.map((c) => ({ id: c.id, name: c.name }))}
                />
            )}

            <div className="space-y-6 p-6 animate-fade-up">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {proposals.length} proposal{proposals.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        New proposal
                    </button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-3">
                    {STATUS_FILTERS.slice(1).map((s) => (
                        <Card
                            key={s.value}
                            className="cursor-pointer hover:border-brand transition-colors"
                            onClick={() => setStatusFilter(s.value)}
                        >
                            <CardContent className="p-3 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                                <p className={cn(
                                    "text-xl font-bold font-mono",
                                    statusFilter === s.value && "text-brand"
                                )}>
                                    {counts[s.value as keyof typeof counts]}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters row */}
                <div className="flex flex-col  gap-3">
                    {/* <span className="text-xs text-neutral-50 md:hidden">scroll to see more</span> */}
                    {/* Status tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-full  overflow-x-scroll md:overflow-x-auto">
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
                                    {counts[f.value === "all" ? "all" : f.value]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search proposals..."
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

                {/* Content */}
                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : filtered.length === 0 ? (
                    <EmptyState hasSearch={!!search || statusFilter !== "all"} onAdd={() => setShowModal(true)} />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                onStatusChange={updateStatus}
                                onDelete={deleteProposal}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-3 animate-pulse">
                    <div className="flex items-start justify-between">
                        <div className="h-5 w-16 bg-muted rounded-lg" />
                        <div className="h-5 w-5 bg-muted rounded-full" />
                    </div>
                    <div className="h-4 w-3/4 bg-muted rounded-full" />
                    <div className="h-4 w-full bg-muted/60 rounded-full" />
                    <div className="h-4 w-2/3 bg-muted/60 rounded-full" />
                    <div className="h-4 w-24 bg-muted rounded-full" />
                    <div className="flex gap-2">
                        <div className="h-7 flex-1 bg-muted rounded-lg" />
                        <div className="h-7 flex-1 bg-muted rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
                {hasSearch ? "No proposals match your search" : "No proposals yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
                {hasSearch ? "Try a different search term" : "Create your first proposal to win more clients"}
            </p>
            {!hasSearch && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create first proposal
                </button>
            )}
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{message}</p>
        </div>
    );
}