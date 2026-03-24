"use client";

import { useState, useMemo } from "react"
import { useProjects } from "@/lib/hooks/use-projects"
import { useClients } from "@/lib/hooks/use-clients";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  getInitials,
  getProjectStatusStyle,
} from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, ProjectStatus } from "@/types";
import {
  FolderKanban, Plus, Search, X, Loader2,
  DollarSign, Trash2, ChevronDown,
  AlertTriangle, Clock,
} from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────
const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  clientId: z.string().min(1, "Select a client"),
  description: z.string().max(500).optional(),
  budget: z.number().min(1, "Budget must be greater than 0"),
  currency: z.enum(["USD", "NGN", "GBP", "EUR", "KES", "GHS"]),
  status: z.enum(["planning", "active", "completed", "on_hold"]),
  deadline: z.string().optional(),
});


type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

// ─── Status config ────────────────────────────────────────────────
const STATUS_COLUMNS: { status: ProjectStatus; label: string; color: string; bg: string }[] = [
  { status: "planning", label: "Planning", color: "text-warning", bg: "bg-warning/10" },
  { status: "active", label: "Active", color: "text-brand", bg: "bg-brand/10" },
  { status: "on_hold", label: "On Hold", color: "text-muted-foreground", bg: "bg-muted" },
  { status: "completed", label: "Completed", color: "text-success", bg: "bg-success/10" },
];

// ─── Create Project Modal ─────────────────────────────────────────
function CreateProjectModal({
  onClose,
  onCreate,
  clients,
}: {
  onClose: () => void;
  onCreate: (data: CreateProjectFormValues) => Promise<boolean>;
  clients: { id: string; name: string }[];
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      clientId: "",
      description: "",
      budget: 0,
      currency: "USD",
      status: "planning",
      deadline: "",
    },
  });

  const onSubmit = async (values: CreateProjectFormValues) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold">New project</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the project details</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project name *</label>
            <input
              type="text"
              placeholder="E-commerce Redesign"
              {...register("name")}
              className={inputCls(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client *</label>
            <select {...register("clientId")} className={cn(inputCls(!!errors.clientId), "cursor-pointer")}>
              <option value="">Select a client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              placeholder="What does this project involve?"
              {...register("description")}
              className={cn(inputCls(), "resize-none")}
            />
          </div>

          {/* Budget + Currency row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget *</label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="5000"
                {...register("budget", { valueAsNumber: true })}
                className={inputCls(!!errors.budget)}
              />
              {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</label>
              <select {...register("currency")} className={cn(inputCls(), "cursor-pointer")}>
                {["USD", "GBP", "EUR", "NGN", "KES", "GHS"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Status + Deadline row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <select {...register("status")} className={cn(inputCls(), "cursor-pointer")}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</label>
              <input
                type="date"
                {...register("deadline")}
                className={inputCls()}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

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
              disabled={isSubmitting}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white",
                "bg-brand hover:bg-brand/90 transition-colors disabled:opacity-60",
              )}
            >
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating...</> : <><Plus className="w-3.5 h-3.5" />Create project</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────
function ProjectCard({
  project,
  onStatusChange,
  onDelete,
}: {
  project: Project;
  onStatusChange: (id: string, status: ProjectStatus) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { label, className } = getProjectStatusStyle(project.status);
  const initials = project.client ? getInitials(project.client.name) : "?";
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "completed";

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-4 space-y-3">
        {/* Header: status badge + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu((s) => !s)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-colors",
                className,
              )}
            >
              {label}
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Status dropdown */}
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} style={{ background: "transparent" }} />
                <div
                  className="absolute left-0 top-7 z-50 w-36 rounded-xl py-1 shadow-xl"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  {STATUS_COLUMNS.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => {
                        onStatusChange(project.id, col.status);
                        setShowStatusMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors",
                        project.status === col.status && "font-semibold",
                      )}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onDelete(project.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
            aria-label="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project name */}
        <div>
          <h3 className="text-sm font-semibold leading-snug">{project.name}</h3>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Budget */}
        <div className="flex items-center gap-1.5 text-sm font-mono font-semibold">
          <DollarSign className="w-3.5 h-3.5 text-earn" />
          {formatCurrency(project.budget, project.currency ?? "USD")}
        </div>

        {/* Footer: client + deadline */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Client avatar + name */}
          <div className="flex items-center gap-2">
            {project.client?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.client.avatar} alt={project.client.name} className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-brand">{initials}</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate max-w-25">
              {project.client?.name ?? "No client"}
            </span>
          </div>

          {/* Deadline */}
          {project.deadline && (
            <div className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
              {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {formatRelativeTime(project.deadline)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects, isLoading, error, createProject, updateStatus, deleteProject } = useProjects();
  const { clients } = useClients();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.client?.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [projects, search]);

  const handleCreate = async (values: CreateProjectFormValues) => {
    return createProject({
      name: values.name,
      clientId: values.clientId,
      client: clients.find((c) => c.id === values.clientId),
      description: values.description,
      budget: values.budget,
      currency: values.currency,
      status: values.status,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
    });
  };

  // Stats
  // const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalBudget = projects.reduce((s, p) => {
    const budget = typeof p.budget === 'number' && !isNaN(p.budget) ? p.budget : 0;
    return s + budget;
  }, 0);
  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  return (
    <>
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        />
      )}

      <div className="space-y-6 p-6 animate-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {projects.length} project{projects.length !== 1 ? "s" : ""} ·{" "}
              {formatCurrency(totalBudget)} total budget
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            New project
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", value: activeCount, color: "text-brand" },
            { label: "Completed", value: completedCount, color: "text-success" },
            { label: "Total budget", value: formatCurrency(totalBudget), color: "text-earn" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className={cn("text-xl font-bold font-mono", s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
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
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <KanbanSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={!!search} onAdd={() => setShowModal(true)} />
        ) : (
          /* Kanban columns */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATUS_COLUMNS.map((col) => {
              const colProjects = filtered.filter((p) => p.status === col.status);
              return (
                <div key={col.status} className="space-y-3">
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", col.bg.replace("/10", ""))} style={{ background: "currentColor" }} />
                      <span className={cn("text-xs font-semibold uppercase tracking-wider", col.color)}>
                        {col.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {colProjects.length}
                    </span>
                  </div>

                  {/* Cards */}
                  {colProjects.length === 0 ? (
                    <div
                      className="rounded-xl border-2 border-dashed border-border/50 p-6 text-center"
                    >
                      <p className="text-xs text-muted-foreground/50">No projects</p>
                    </div>
                  ) : (
                    colProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onStatusChange={updateStatus}
                        onDelete={deleteProject}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, col) => (
        <div key={col} className="space-y-3">
          <div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3 animate-pulse">
              <div className="h-5 w-16 bg-muted rounded-lg" />
              <div className="h-4 w-full bg-muted rounded-full" />
              <div className="h-4 w-2/3 bg-muted/60 rounded-full" />
              <div className="h-4 w-24 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FolderKanban className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">
        {hasSearch ? "No projects match your search" : "No projects yet"}
      </p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        {hasSearch ? "Try a different search term" : "Create your first project to get started"}
      </p>
      {!hasSearch && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create first project
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