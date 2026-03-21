"use client";

import { useCallback, useEffect, useState } from "react";
import { InvoicesAPI } from "@/lib/api";
import type { Invoice, InvoiceStatus } from "@/types";
import { toast } from "sonner";

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  totals: {
    all: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  filterByStatus: (status: InvoiceStatus | "all") => Invoice[];
}

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await InvoicesAPI.getInvoices();
      if (res.success && res.data) {
        setInvoices(res.data);
      } else {
        setError(res.error ?? "Failed to load invoices");
        toast.error("Could not load invoices");
      }
    } catch {
      setError("Network error loading invoices");
      toast.error("Network error — check your connection");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const sum = (status: InvoiceStatus) =>
    invoices
      .filter((i) => i.status === status)
      .reduce((acc, i) => acc + i.amount, 0);

  const totals = {
    all: invoices.reduce((acc, i) => acc + i.amount, 0),
    paid: sum("paid"),
    pending: sum("sent"),
    overdue: sum("overdue"),
  };

  const filterByStatus = (status: InvoiceStatus | "all") =>
    status === "all" ? invoices : invoices.filter((i) => i.status === status);

  return {
    invoices,
    isLoading,
    error,
    refresh: fetchInvoices,
    totals,
    filterByStatus,
  };
}
