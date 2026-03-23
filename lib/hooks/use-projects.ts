"use client";

import { useCallback, useEffect, useState } from "react";
import { ProjectsAPI } from "../api";
import type { Project, ProjectStatus } from "../../types";
import { toast } from "sonner";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (
    p: Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<boolean>;
  updateStatus: (id: string, status: ProjectStatus) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ProjectsAPI.getProjects();
      if (res.success && res.data) setProjects(res.data);
      else setError(res.error ?? "Failed to load projects");
    } catch {
      setError("Network error loading projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createProject = useCallback(
    async (
      data: Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">,
    ): Promise<boolean> => {
      try {
        const res = await ProjectsAPI.createProject(data);
        if (res.success && res.data) {
          setProjects((prev) => [res.data!, ...prev]);
          toast.success("Project created", {
            description: `"${data.name}" is ready.`,
          });
          return true;
        }
        toast.error("Failed to create project", { description: res.error });
        return false;
      } catch {
        toast.error("Network error");
        return false;
      }
    },
    [],
  );

  const updateStatus = useCallback(
    async (id: string, status: ProjectStatus): Promise<boolean> => {
      try {
        const res = await ProjectsAPI.updateProject(id, { status });
        if (res.success) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status } : p)),
          );
          toast.success(`Project marked as ${status.replace("_", " ")}`);
          return true;
        }
        return false;
      } catch {
        toast.error("Failed to update project");
        return false;
      }
    },
    [],
  );

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await ProjectsAPI.deleteProject(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Project deleted");
        return true;
      }
      return false;
    } catch {
      toast.error("Failed to delete project");
      return false;
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    refresh: fetch,
    createProject,
    updateStatus,
    deleteProject,
  };
}
