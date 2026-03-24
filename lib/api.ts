/**
 * lib/api.ts — FreelanceOS API Layer
 *
 * Architecture decision: feature-flag controlled mock/real switching.
 * All types come from @/types — never define types here.
 *
 * SECURITY NOTE on JWT storage:
 * We use localStorage for the hackathon. In production, tokens should be
 * stored in httpOnly cookies set by the server, so JS (including injected
 * malicious scripts) cannot access them. localStorage is vulnerable to XSS.
 */

import axios from "axios";
import type {
  ApiResponse,
  Client,
  Project,
  Invoice,
  Milestone,
  Proposal,
  DashboardStats,
  EarningsDataPoint,
  ActivityItem,
  ProposalStatus,
} from "@/types";
import { toast } from "sonner";

// --------------- Axios Instance ---------------

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  // Timeout prevents hanging requests on bad network (common in Nigeria)
  timeout: 15_000,
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("fos_token"); // namespaced key
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error normalisation — never let axios errors bubble as raw AxiosError
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear it and let auth middleware handle redirect
      if (typeof window !== "undefined") localStorage.removeItem("fos_token");
    }
    return Promise.reject(error);
  },
);

// --------------- Toggle ---------------

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// --------------- Utilities ---------------

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function mockSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

// --------------- Mock Data ---------------

const mockClients: Client[] = [
  {
    id: "c_1",
    userId: "u_1",
    name: "Tunde Adeyemi",
    email: "tunde@techstartng.com",
    company: "TechStart Nigeria",
    country: "NG",
    avatar:
      "https://ui-avatars.com/api/?name=Tunde+Adeyemi&background=2563EB&color=fff&bold=true",
    totalBilled: 18500,
    createdAt: "2025-10-01T08:00:00Z",
  },
  {
    id: "c_2",
    userId: "u_1",
    name: "Amara Okafor",
    email: "amara@designco.io",
    company: "DesignCo",
    country: "US",
    avatar:
      "https://ui-avatars.com/api/?name=Amara+Okafor&background=10B981&color=fff&bold=true",
    totalBilled: 12250,
    createdAt: "2025-11-15T10:30:00Z",
  },
  {
    id: "c_3",
    userId: "u_1",
    name: "James Kirkland",
    email: "james@kirkland.dev",
    company: "Kirkland Digital",
    country: "GB",
    avatar:
      "https://ui-avatars.com/api/?name=James+Kirkland&background=F59E0B&color=fff&bold=true",
    totalBilled: 14500,
    createdAt: "2025-12-01T14:00:00Z",
  },
];

const mockProjects: Project[] = [
  {
    id: "p_1",
    userId: "u_1",
    clientId: "c_1",
    client: mockClients[0],
    name: "E-commerce Platform Redesign",
    description:
      "Full redesign of the existing storefront with new checkout flow.",
    status: "active",
    budget: 4500,
    currency: "USD",
    deadline: "2026-04-15T00:00:00Z",
    createdAt: "2025-12-10T09:00:00Z",
    updatedAt: "2026-01-20T11:00:00Z",
  },
  {
    id: "p_2",
    userId: "u_1",
    clientId: "c_2",
    client: mockClients[1],
    name: "Mobile App MVP",
    description: "React Native MVP for task management startup.",
    status: "active",
    budget: 8000,
    currency: "USD",
    deadline: "2026-05-01T00:00:00Z",
    createdAt: "2026-01-05T10:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "p_3",
    userId: "u_1",
    clientId: "c_3",
    client: mockClients[2],
    name: "Brand Identity System",
    description: "Logo, typography, color system, and component library.",
    status: "completed",
    budget: 6500,
    currency: "USD",
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2025-12-20T16:00:00Z",
  },
  {
    id: "p_4",
    userId: "u_1",
    clientId: "c_1",
    client: mockClients[0],
    name: "API Integration Suite",
    description:
      "Third-party API integrations: payments, analytics, notifications.",
    status: "planning",
    budget: 3500,
    currency: "USD",
    deadline: "2026-06-01T00:00:00Z",
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-02-20T09:00:00Z",
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    userId: "u_1",
    clientId: "c_1",
    client: mockClients[0],
    projectId: "p_1",
    number: "INV-2026-001",
    amount: 2250,
    currency: "USD",
    status: "paid",
    issueDate: "2026-02-01T00:00:00Z",
    dueDate: "2026-02-15T00:00:00Z",
    paidAt: "2026-02-13T10:30:00Z",
    items: [
      {
        description: "UI Design — Phase 1",
        quantity: 1,
        rate: 1500,
        amount: 1500,
      },
      {
        description: "Prototype & handoff",
        quantity: 1,
        rate: 750,
        amount: 750,
      },
    ],
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-13T00:00:00Z",
  },
  {
    id: "inv_2",
    userId: "u_1",
    clientId: "c_2",
    client: mockClients[1],
    projectId: "p_2",
    number: "INV-2026-002",
    amount: 4000,
    currency: "USD",
    status: "sent",
    issueDate: "2026-03-01T00:00:00Z",
    dueDate: "2026-03-25T00:00:00Z",
    paymentLink: "https://pay.raenest.com/mock-link-xyz",
    items: [
      {
        description: "App Development — Sprint 1",
        quantity: 1,
        rate: 2500,
        amount: 2500,
      },
      { description: "QA & Testing", quantity: 1, rate: 1500, amount: 1500 },
    ],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "inv_3",
    userId: "u_1",
    clientId: "c_3",
    client: mockClients[2],
    projectId: "p_3",
    number: "INV-2026-003",
    amount: 6500,
    currency: "USD",
    status: "overdue",
    issueDate: "2026-01-15T00:00:00Z",
    dueDate: "2026-02-15T00:00:00Z",
    items: [
      {
        description: "Brand Identity System — Full Delivery",
        quantity: 1,
        rate: 6500,
        amount: 6500,
      },
    ],
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "m_1",
    projectId: "p_1",
    name: "Design Phase",
    amount: 1500,
    status: "completed",
    dueDate: "2026-02-15T00:00:00Z",
    completedAt: "2026-02-13T00:00:00Z",
  },
  {
    id: "m_2",
    projectId: "p_1",
    name: "Frontend Development",
    amount: 2000,
    status: "pending",
    dueDate: "2026-03-30T00:00:00Z",
  },
  {
    id: "m_3",
    projectId: "p_2",
    name: "MVP Feature Set",
    amount: 4000,
    status: "pending",
    dueDate: "2026-04-15T00:00:00Z",
  },
];

const mockDashboardStats: DashboardStats = {
  totalEarnings: 45_250.75,
  monthlyEarnings: 8_750.5,
  earningsGrowth: 23.5,
  activeProjects: 4,
  activeProjectsGrowth: 2,
  pendingInvoices: 3,
  pendingInvoicesAmount: 12_500,
  overdueInvoices: 1,
  overdueInvoicesAmount: 6_500,
  recentClients: mockClients,
  upcomingDeadlines: [
    {
      id: "p_1",
      type: "project",
      title: "E-commerce Redesign — Final Delivery",
      date: "2026-04-15T00:00:00Z",
      clientName: "TechStart Nigeria",
    },
    {
      id: "inv_2",
      type: "invoice",
      title: "INV-2026-002 — Mobile App MVP",
      date: "2026-03-25T00:00:00Z",
      amount: 4000,
      clientName: "DesignCo",
    },
    {
      id: "m_2",
      type: "milestone",
      title: "Frontend Development Milestone",
      date: "2026-03-30T00:00:00Z",
      amount: 2000,
      clientName: "TechStart Nigeria",
    },
  ],
};

const mockEarnings: EarningsDataPoint[] = [
  { month: "Oct 2025", amount: 3_200, date: "2025-10-01T00:00:00Z" },
  { month: "Nov 2025", amount: 4_800, date: "2025-11-01T00:00:00Z" },
  { month: "Dec 2025", amount: 5_200, date: "2025-12-01T00:00:00Z" },
  { month: "Jan 2026", amount: 6_100, date: "2026-01-01T00:00:00Z" },
  { month: "Feb 2026", amount: 7_250, date: "2026-02-01T00:00:00Z" },
  { month: "Mar 2026", amount: 8_750, date: "2026-03-01T00:00:00Z" },
];

const mockActivity: ActivityItem[] = [
  {
    id: "act_1",
    type: "invoice_paid",
    message: "Invoice INV-2026-001 was paid",
    timestamp: "2026-03-10T14:30:00Z",
    amount: 2250,
    clientName: "TechStart Nigeria",
    entityId: "inv_1",
  },
  {
    id: "act_2",
    type: "project_created",
    message: 'New project "API Integration Suite" created',
    timestamp: "2026-02-20T09:15:00Z",
    clientName: "TechStart Nigeria",
    entityId: "p_4",
  },
  {
    id: "act_3",
    type: "milestone_completed",
    message: "Design Phase milestone completed",
    timestamp: "2026-02-13T16:45:00Z",
    amount: 1500,
    clientName: "TechStart Nigeria",
    entityId: "m_1",
  },
  {
    id: "act_4",
    type: "client_added",
    message: "New client James Kirkland onboarded",
    timestamp: "2025-12-01T14:00:00Z",
    clientName: "Kirkland Digital",
    entityId: "c_3",
  },
];

// --------------- API Services ---------------

export const DashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    if (!USE_MOCK) {
      const { data } =
        await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
      return data;
    }
    await delay(700);
    return mockSuccess(mockDashboardStats);
  },

  getEarningsOverTime: async (
    period: "monthly" | "weekly" = "monthly",
  ): Promise<ApiResponse<EarningsDataPoint[]>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<EarningsDataPoint[]>>(
        "/dashboard/earnings",
        { params: { period } },
      );
      return data;
    }
    await delay(500);
    return mockSuccess(mockEarnings);
  },

  getRecentActivity: async (): Promise<ApiResponse<ActivityItem[]>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<ActivityItem[]>>(
        "/dashboard/activity",
      );
      return data;
    }
    await delay(400);
    return mockSuccess(mockActivity);
  },
};

export const ClientsAPI = {
  getClients: async (): Promise<ApiResponse<Client[]>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<Client[]>>("/clients");
      return data;
    }
    await delay(500);
    return mockSuccess(mockClients);
  },

  getClient: async (id: string): Promise<ApiResponse<Client>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<Client>>(
        `/clients/${id}`,
      );
      return data;
    }
    await delay(300);
    const client = mockClients.find((c) => c.id === id);
    if (!client) return { success: false, error: "Client not found" };
    return mockSuccess(client);
  },

  createClient: async (
    payload: Omit<Client, "id" | "userId" | "createdAt">,
  ): Promise<ApiResponse<Client>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.post<ApiResponse<Client>>(
        "/clients",
        payload,
      );
      return data;
    }
    await delay(600);
    const newClient: Client = {
      ...payload,
      id: `c_${Date.now()}`,
      userId: "u_1",
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=2563EB&color=fff&bold=true`,
    };
    mockClients.unshift(newClient);
    return mockSuccess(newClient);
  },

  updateClient: async (
    id: string,
    payload: Partial<Client>,
  ): Promise<ApiResponse<Client>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.put<ApiResponse<Client>>(
        `/clients/${id}`,
        payload,
      );
      return data;
    }
    await delay(400);
    const idx = mockClients.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: "Client not found" };
    mockClients[idx] = { ...mockClients[idx], ...payload };
    return mockSuccess(mockClients[idx]);
  },

  deleteClient: async (id: string): Promise<ApiResponse<null>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/clients/${id}`,
      );
      return data;
    }
    await delay(400);
    const idx = mockClients.findIndex((c) => c.id === id);
    if (idx !== -1) mockClients.splice(idx, 1);
    return mockSuccess(null);
  },
};

export const ProjectsAPI = {
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<Project[]>>("/projects");
      return data;
    }
    await delay(600);
    return mockSuccess(mockProjects);
  },

  createProject: async (
    payload: Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Project>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.post<ApiResponse<Project>>(
        "/projects",
        payload,
      );
      return data;
    }
    await delay(600);
    const client = mockClients.find((c) => c.id === payload.clientId);
    const newProject: Project = {
      ...payload,
      id: `p_${Date.now()}`,
      userId: "u_1",
      client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProjects.unshift(newProject);
    return mockSuccess(newProject);
  },

  updateProject: async (
    id: string,
    payload: Partial<Project>,
  ): Promise<ApiResponse<Project>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.put<ApiResponse<Project>>(
        `/projects/${id}`,
        payload,
      );
      return data;
    }
    await delay(400);
    const idx = mockProjects.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: "Project not found" };
    mockProjects[idx] = {
      ...mockProjects[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return mockSuccess(mockProjects[idx]);
  },

  deleteProject: async (id: string): Promise<ApiResponse<null>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/projects/${id}`,
      );
      return data;
    }
    await delay(400);
    const idx = mockProjects.findIndex((p) => p.id === id);
    if (idx !== -1) mockProjects.splice(idx, 1);
    return mockSuccess(null);
  },
};

export const InvoicesAPI = {
  getInvoices: async (): Promise<ApiResponse<Invoice[]>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<Invoice[]>>("/invoices");
      return data;
    }
    await delay(500);
    return mockSuccess(mockInvoices);
  },

  createInvoice: async (
    payload: Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Invoice>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.post<ApiResponse<Invoice>>(
        "/invoices",
        payload,
      );
      return data;
    }
    await delay(700);
    const count = mockInvoices.length + 1;
    const newInvoice: Invoice = {
      ...payload,
      id: `inv_${Date.now()}`,
      userId: "u_1",
      number: `INV-2026-${String(count).padStart(3, "0")}`,
      // Auto-generate Raenest payment link placeholder
      paymentLink: `https://pay.raenest.com/fos-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockInvoices.unshift(newInvoice);
    return mockSuccess(newInvoice);
  },

  updateInvoice: async (
    id: string,
    payload: Partial<Invoice>,
  ): Promise<ApiResponse<Invoice>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.put<ApiResponse<Invoice>>(
        `/invoices/${id}`,
        payload,
      );
      return data;
    }
    await delay(400);
    const idx = mockInvoices.findIndex((inv) => inv.id === id);
    if (idx === -1) return { success: false, error: "Invoice not found" };
    mockInvoices[idx] = {
      ...mockInvoices[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return mockSuccess(mockInvoices[idx]);
  },

  deleteInvoice: async (id: string): Promise<ApiResponse<null>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/invoices/${id}`,
      );
      return data;
    }
    await delay(400);
    const idx = mockInvoices.findIndex((inv) => inv.id === id);
    if (idx !== -1) mockInvoices.splice(idx, 1);
    return mockSuccess(null);
  },

  generatePaymentLink: async (
    invoiceId: string,
    amount: number,
    currency: string,
  ): Promise<ApiResponse<{ link: string }>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.post<ApiResponse<{ link: string }>>(
        `/invoices/${invoiceId}/payment-link`,
        { amount, currency },
      );
      return data;
    }
    await delay(500);
    // Mock Raenest payment link - in production, this would call Raenest API
    const mockLink = `https://pay.raenest.com/fos-${invoiceId}-${Date.now()}`;
    return mockSuccess({ link: mockLink });
  },

  sendInvoice: async (
    invoiceId: string,
    email: string,
  ): Promise<ApiResponse<null>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.post<ApiResponse<null>>(
        `/invoices/${invoiceId}/send`,
        { email },
      );
      return data;
    }
    await delay(600);
    toast.success("Invoice sent", { description: `Sent to ${email}` });
    return mockSuccess(null);
  },
};

export const MilestonesAPI = {
  getMilestones: async (
    projectId?: string,
  ): Promise<ApiResponse<Milestone[]>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<Milestone[]>>(
        "/milestones",
        {
          params: { projectId },
        },
      );
      return data;
    }
    await delay(400);
    const filtered = projectId
      ? mockMilestones.filter((m) => m.projectId === projectId)
      : mockMilestones;
    return mockSuccess(filtered);
  },
};

export const ProposalsAPI = {
  getProposals: async (): Promise<ApiResponse<Proposal[]>> => {
    if (!USE_MOCK) {
      const { data } =
        await apiClient.get<ApiResponse<Proposal[]>>("/proposals");
      return data;
    }
    await delay(600);
    // Return mock proposals
    const mockProposals: Proposal[] = [
      {
        id: "prop_1",
        userId: "u_1",
        clientId: "c_1",
        client: mockClients[0],
        title: "E-commerce Platform Redesign Proposal",
        content:
          "Complete redesign of the existing storefront with new checkout flow. Includes UI design, frontend development, and testing.",
        status: "sent",
        amount: 4500,
        currency: "USD",
        validUntil: "2026-04-15T00:00:00Z",
        createdAt: "2026-02-20T09:00:00Z",
        updatedAt: "2026-02-20T09:00:00Z",
      },
      {
        id: "prop_2",
        userId: "u_1",
        clientId: "c_2",
        client: mockClients[1],
        title: "Mobile App MVP Proposal",
        content:
          "React Native MVP for task management startup. Includes authentication, task CRUD, and push notifications.",
        status: "draft",
        amount: 8000,
        currency: "USD",
        createdAt: "2026-03-01T10:00:00Z",
        updatedAt: "2026-03-01T10:00:00Z",
      },
    ];
    return mockSuccess(mockProposals);
  },

  getProposal: async (id: string): Promise<ApiResponse<Proposal>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.get<ApiResponse<Proposal>>(
        `/proposals/${id}`,
      );
      return data;
    }
    await delay(300);
    const mockProposals: Proposal[] = [
      {
        id: "prop_1",
        userId: "u_1",
        clientId: "c_1",
        client: mockClients[0],
        title: "E-commerce Platform Redesign Proposal",
        content: "Complete redesign...",
        status: "sent",
        amount: 4500,
        currency: "USD",
        validUntil: "2026-04-15T00:00:00Z",
        createdAt: "2026-02-20T09:00:00Z",
        updatedAt: "2026-02-20T09:00:00Z",
      },
    ];
    const proposal = mockProposals.find((p) => p.id === id);
    if (!proposal) return { success: false, error: "Proposal not found" };
    return mockSuccess(proposal);
  },

  createProposal: async (
    payload: Omit<Proposal, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Proposal>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.post<ApiResponse<Proposal>>(
        "/proposals",
        payload,
      );
      return data;
    }
    await delay(700);
    const newProposal: Proposal = {
      ...payload,
      id: `prop_${Date.now()}`,
      userId: "u_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockSuccess(newProposal);
  },

  updateProposal: async (
    id: string,
    payload: Partial<Proposal>,
  ): Promise<ApiResponse<Proposal>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.put<ApiResponse<Proposal>>(
        `/proposals/${id}`,
        payload,
      );
      return data;
    }
    await delay(400);
    // Mock update
    const updatedProposal: Proposal = {
      id,
      userId: "u_1",
      clientId: "c_1",
      client: mockClients[0],
      title: "Updated Proposal",
      content: "Updated content",
      status: (payload.status as ProposalStatus) || "draft",
      amount: 5000,
      currency: "USD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockSuccess(updatedProposal);
  },

  deleteProposal: async (id: string): Promise<ApiResponse<null>> => {
    if (!USE_MOCK) {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/proposals/${id}`,
      );
      return data;
    }
    await delay(400);
    return mockSuccess(null);
  },
};
