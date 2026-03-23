"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { InvoicesAPI } from "@/lib/api";
import { cn, formatCurrency, formatDate, getInvoiceStatusStyle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Invoice } from "@/types";
import {
    ArrowLeft,
    Copy,
    Send,
    CheckCircle2,
    Link2,
    Loader2,
    AlertTriangle,
    Download,
    ExternalLink,
    Printer,
} from "lucide-react";

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.id as string;
    const { invoices, updateStatus, refresh } = useInvoices();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const found = invoices.find((inv) => inv.id === invoiceId);
        if (found) {
            setInvoice(found);
            setIsLoading(false);
        } else if (!isLoading && invoices.length > 0) {
            setIsLoading(false);
        }
    }, [invoices, invoiceId, isLoading]);

    // Fetch specific invoice if not found in list
    useEffect(() => {
        if (!invoice && !isLoading && invoices.length > 0) {
            toast.error("Invoice not found");
            router.push("/invoices");
        }
    }, [invoice, isLoading, invoices, router]);

    const handleCopyLink = async () => {
        if (!invoice?.paymentLink) {
            toast.error("No payment link available");
            return;
        }
        try {
            await navigator.clipboard.writeText(invoice.paymentLink);
            toast.success("Payment link copied!", {
                description: "Share this Raenest link with your client.",
            });
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = invoice.paymentLink;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            toast.success("Payment link copied!");
        }
    };

    const handleGenerateLink = async () => {
        setGeneratingLink(true);
        try {
            const res = await InvoicesAPI.generatePaymentLink(
                invoiceId,
                invoice?.amount || 0,
                invoice?.currency || "USD"
            );
            if (res.success && res.data) {
                await updateStatus(invoiceId, "sent");
                toast.success("Payment link generated!", {
                    description: "Share this link with your client to receive payment.",
                });
                refresh();
            } else {
                toast.error("Failed to generate link", { description: res.error });
            }
        } catch {
            toast.error("Network error");
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleSendInvoice = async () => {
        if (!email) {
            toast.error("Email is required");
            return;
        }
        setSending(true);
        try {
            const res = await InvoicesAPI.sendInvoice(invoiceId, email);
            if (res.success) {
                toast.success("Invoice sent!", {
                    description: `Sent to ${email}`,
                });
                setShowSendModal(false);
                setEmail("");
            } else {
                toast.error("Failed to send", { description: res.error });
            }
        } catch {
            toast.error("Network error");
        } finally {
            setSending(false);
        }
    };

    const handleMarkPaid = async () => {
        const res = await updateStatus(invoiceId, "paid");
        if (res) {
            toast.success("Invoice marked as paid");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
                <p className="text-muted-foreground">Invoice not found</p>
                <Link href="/invoices" className="text-brand hover:underline">
                    Back to invoices
                </Link>
            </div>
        );
    }

    const { label, className } = getInvoiceStatusStyle(invoice.status);
    const isPaid = invoice.status === "paid";
    const isSent = invoice.status === "sent";
    const isOverdue = invoice.status === "overdue";

    return (
        <div className="space-y-6 p-6 animate-fade-up max-w-4xl mx-auto print:p-0 print:space-y-0">
            {/* Header with back button */}
            <div className="flex items-center justify-between print:hidden">
                <Link
                    href="/invoices"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to invoices
                </Link>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                </Button>
            </div>

            {/* Invoice Card */}
            <Card className="overflow-hidden print:shadow-none print:border-0">
                <CardContent className="p-0">
                    {/* Header with status */}
                    <div
                        className="flex items-center justify-between p-6 border-b border-border"
                        style={{ background: "var(--muted)" }}
                    >
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{invoice.number}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Issued {formatDate(invoice.issueDate)}
                            </p>
                        </div>
                        <div className="text-right">
                            <span
                                className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                    className
                                )}
                            >
                                {label}
                            </span>
                        </div>
                    </div>

                    {/* Client & Amount */}
                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Bill To
                            </p>
                            <p className="font-semibold">{invoice.client?.name || "—"}</p>
                            {invoice.client?.email && (
                                <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                            )}
                            {invoice.client?.company && (
                                <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Amount Due
                            </p>
                            <p className="text-3xl font-bold font-mono">
                                {formatCurrency(invoice.amount, invoice.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Due {formatDate(invoice.dueDate)}
                                {isOverdue && <span className="text-destructive ml-1">(Overdue)</span>}
                            </p>
                        </div>
                    </div>

                    {/* Line Items */}
                    {invoice.items && invoice.items.length > 0 && (
                        <div className="px-6">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                Items
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 text-sm font-medium">Description</th>
                                            <th className="text-right py-2 text-sm font-medium">Qty</th>
                                            <th className="text-right py-2 text-sm font-medium">Rate</th>
                                            <th className="text-right py-2 text-sm font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-border/50">
                                                <td className="py-2 text-sm">{item.description}</td>
                                                <td className="py-2 text-right text-sm">{item.quantity}</td>
                                                <td className="py-2 text-right text-sm font-mono">
                                                    {formatCurrency(item.rate, invoice.currency)}
                                                </td>
                                                <td className="py-2 text-right text-sm font-mono">
                                                    {formatCurrency(item.amount, invoice.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="py-3 text-right font-semibold">
                                                Total
                                            </td>
                                            <td className="py-3 text-right font-bold font-mono">
                                                {formatCurrency(invoice.amount, invoice.currency)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="px-6 pt-4 pb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Notes
                            </p>
                            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Raenest Payment Section */}
                    <div
                        className="mt-6 p-6"
                        style={{ background: "var(--brand-muted)", borderTop: "1px solid var(--border)" }}
                    >
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 className="w-4 h-4 text-brand" />
                                    <span className="text-sm font-semibold">Pay via Raenest</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Receive international payments in USD, GBP, EUR, and more.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {invoice.paymentLink ? (
                                    <>
                                        <Button
                                            onClick={handleCopyLink}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy link
                                        </Button>
                                        <Button
                                            onClick={() => window.open(invoice.paymentLink, "_blank")}
                                            size="sm"
                                            className="gap-2 bg-brand hover:bg-brand/90"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open payment page
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleGenerateLink}
                                        disabled={generatingLink || isPaid}
                                        size="sm"
                                        className="gap-2 bg-brand hover:bg-brand/90"
                                    >
                                        {generatingLink ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Link2 className="w-4 h-4" />
                                        )}
                                        Generate Raenest link
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end print:hidden">
                {!isPaid && !isSent && !invoice.paymentLink && (
                    <Button
                        onClick={() => setShowSendModal(true)}
                        variant="outline"
                        className="gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send invoice
                    </Button>
                )}
                {!isPaid && (
                    <Button
                        onClick={handleMarkPaid}
                        className="gap-2 bg-success hover:bg-success/90 text-white"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as paid
                    </Button>
                )}
                <Button
                    onClick={() => {
                        const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
                        window.open(pdfUrl, "_blank");
                    }}
                    variant="outline"
                    className="gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </Button>
            </div>

            {/* Send Invoice Modal */}
            {showSendModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
                    onClick={() => setShowSendModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl p-6"
                        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-2">Send Invoice</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Send this invoice to your client via email.
                        </p>
                        <input
                            type="email"
                            placeholder="client@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="flex-1 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendInvoice}
                                disabled={sending}
                                className="flex-1 py-2 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}