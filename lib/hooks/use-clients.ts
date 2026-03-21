"use client";

import { useCallback, useEffect, useState } from "react";
import { ClientsAPI } from "@/lib/api";
import type { Client } from "@/types";
import { toast } from "sonner";

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  totalBilled: number;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ClientsAPI.getClients();
      if (res.success && res.data) {
        setClients(res.data);
      } else {
        setError(res.error ?? "Failed to load clients");
        toast.error("Could not load clients");
      }
    } catch {
      setError("Network error loading clients");
      toast.error("Network error — check your connection");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const totalBilled = clients.reduce((sum, c) => sum + (c.totalBilled ?? 0), 0);

  return { clients, isLoading, error, refresh: fetchClients, totalBilled };
}
