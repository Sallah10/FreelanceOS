"use client";

import { useCallback, useEffect, useState } from "react";
import { ClientsAPI } from "@/lib/api";
import type {
  Client,
  //  ApiResponse
} from "@/types";
import { toast } from "sonner";

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addClient: (
    client: Omit<Client, "id" | "userId" | "createdAt">,
  ) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ClientsAPI.getClients();
      if (res.success && res.data) {
        setClients(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.error ?? "Failed to load clients");
        setClients([]);
      }
    } catch {
      setError("Network error loading clients");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addClient = useCallback(
    async (
      newClient: Omit<Client, "id" | "userId" | "createdAt">,
    ): Promise<boolean> => {
      try {
        const res = await ClientsAPI.createClient(newClient);
        if (res.success && res.data) {
          setClients((prev) => [res.data!, ...prev]);
          toast.success("Client added", {
            description: `${newClient.name} has been added.`,
          });
          return true;
        }
        toast.error("Failed to add client", { description: res.error });
        return false;
      } catch {
        toast.error("Network error", { description: "Could not add client." });
        return false;
      }
    },
    [],
  );

  const deleteClient = useCallback(
    async (id: string): Promise<boolean> => {
      const client = clients.find((c) => c.id === id);
      try {
        const res = await ClientsAPI.deleteClient(id);
        if (res.success) {
          setClients((prev) => prev.filter((c) => c.id !== id));
          toast.success("Client removed", {
            description: `${client?.name ?? "Client"} deleted.`,
          });
          return true;
        }
        toast.error("Failed to delete client");
        return false;
      } catch {
        toast.error("Network error", {
          description: "Could not delete client.",
        });
        return false;
      }
    },
    [clients],
  );

  return { clients, isLoading, error, refresh: fetch, addClient, deleteClient };
}
