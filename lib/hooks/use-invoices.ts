"use client";

import { useCallback, useEffect, useState } from "react";
import { InvoicesAPI } from "@/lib/api";
import type { Invoice } from "@/types";
import { toast } from "sonner";

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createInvoice: (
    invoice: Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<boolean>;
  updateStatus: (id: string, status: Invoice["status"]) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
}

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await InvoicesAPI.getInvoices();
      if (res.success && res.data) {
        setInvoices(res.data);
      } else {
        setError(res.error ?? "Failed to load invoices");
      }
    } catch {
      setError("Network error loading invoices");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createInvoice = useCallback(
    async (
      data: Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt">,
    ): Promise<boolean> => {
      try {
        const res = await InvoicesAPI.createInvoice(data);
        if (res.success && res.data) {
          setInvoices((prev) => [res.data!, ...prev]);
          toast.success("Invoice created", {
            description: `${res.data.number} is ready to send.`,
          });
          return true;
        }
        toast.error("Failed to create invoice", { description: res.error });
        return false;
      } catch {
        toast.error("Network error");
        return false;
      }
    },
    [],
  );

  const updateStatus = useCallback(
    async (id: string, status: Invoice["status"]): Promise<boolean> => {
      try {
        const res = await InvoicesAPI.updateInvoice(id, { status });
        if (res.success) {
          setInvoices((prev) =>
            prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
          );
          toast.success(`Invoice marked as ${status}`);
          return true;
        }
        return false;
      } catch {
        toast.error("Failed to update invoice");
        return false;
      }
    },
    [],
  );

  const deleteInvoice = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await InvoicesAPI.deleteInvoice(id);
      if (res.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        toast.success("Invoice deleted");
        return true;
      }
      return false;
    } catch {
      toast.error("Failed to delete invoice");
      return false;
    }
  }, []);

  return {
    invoices,
    isLoading,
    error,
    refresh: fetch,
    createInvoice,
    updateStatus,
    deleteInvoice,
  };
}
