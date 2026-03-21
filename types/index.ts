// ============================================================
// FREELANCEOS — TYPE DEFINITIONS
// Single source of truth. Never import types from api.ts.
// If you need a type, add it here and export it.
// ============================================================

// --------------- Primitives ---------------

/** ISO 8601 date string — always store dates as this */
export type ISODateString = string;

/** 3-letter currency code: "USD", "NGN", "GBP" */
export type CurrencyCode = "USD" | "NGN" | "GBP" | "EUR" | "KES" | "GHS";

// --------------- Status Unions ---------------

export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type MilestoneStatus = "pending" | "completed" | "paid";
export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";

// --------------- Core Entities ---------------

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: CurrencyCode;
  avatar?: string;
  timezone?: string;
  raenestAccountId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  avatar?: string;
  totalBilled?: number;
  createdAt: ISODateString;
}

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  client?: Client; // populated when joined with client table
  name: string;
  description?: string;
  status: ProjectStatus;
  budget: number;
  currency: CurrencyCode;
  deadline?: ISODateString;
  milestones?: Milestone[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number; // quantity × rate — computed, not stored
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  client?: Client;
  projectId?: string;
  project?: Project;
  number: string; // e.g., "INV-2026-001"
  amount: number;
  currency: CurrencyCode;
  status: InvoiceStatus;
  issueDate: ISODateString;
  dueDate: ISODateString;
  paidAt?: ISODateString;
  paymentLink?: string; // Raenest shareable payment link
  items?: InvoiceItem[];
  notes?: string;
  taxRate?: number; // percentage, e.g., 7.5
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Milestone {
  id: string;
  projectId: string;
  project?: Project;
  name: string;
  description?: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: ISODateString;
  completedAt?: ISODateString;
}

export interface Proposal {
  id: string;
  userId: string;
  clientId: string;
  client?: Client;
  title: string;
  content: string;
  status: ProposalStatus;
  amount: number;
  currency: CurrencyCode;
  validUntil?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// --------------- Dashboard / Analytics ---------------

export interface EarningsDataPoint {
  month: string; // display label, e.g., "Mar 2026"
  amount: number;
  date: ISODateString; // for sorting/filtering
}

export type DeadlineType = "project" | "invoice" | "milestone";

export interface UpcomingDeadline {
  id: string;
  type: DeadlineType;
  title: string;
  date: ISODateString;
  amount?: number;
  clientName: string;
  isOverdue?: boolean;
}

export interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  earningsGrowth: number; // percentage vs last month
  activeProjects: number;
  activeProjectsGrowth: number; // delta count vs last month
  pendingInvoices: number;
  pendingInvoicesAmount: number;
  overdueInvoices: number;
  overdueInvoicesAmount: number;
  recentClients: Client[];
  upcomingDeadlines: UpcomingDeadline[];
}

export type ActivityType =
  | "invoice_paid"
  | "invoice_sent"
  | "project_created"
  | "project_completed"
  | "milestone_completed"
  | "client_added"
  | "proposal_accepted";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: ISODateString;
  amount?: number;
  clientName?: string;
  entityId?: string; // id of the related invoice/project/etc
}

// --------------- API ---------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
