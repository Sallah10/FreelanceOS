<div align="center">

# FreelanceOS

### Command Centre for African Freelancers

**Win international work. Get paid. Stay organised.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Hackathon](https://img.shields.io/badge/DevCareer_×_Raenest-Hackathon_2026-orange?style=flat-square)](https://devcareer.io)

<br />

**[🚀 Live Demo](https://freelance-os-ten.vercel.app/) · [📡 API](https://frealanceos-api.onrender.com) · [📖 API Docs](https://freelance-os-ten.vercel.app/docs) · [⚙️ Backend Repo](https://github.com/Sallah10/frealanceOs-Api)****

<br />

<img width="1715" height="683" alt="Screenshot 2026-03-20 2312031" src="https://github.com/user-attachments/assets/bdbacab9-361c-41e5-8938-572efccec51d" />


</div>

---

## The Problem

African freelancers are winning international clients — but the infrastructure hasn't caught up.

- **Payment friction** - Clients abroad struggle to pay in local-friendly ways
- **No central hub** - Client info lives in WhatsApp, invoices in Google Docs, deadlines in Excel
- **Invoice management** - Tracking who owes what, and chasing overdue payments
- **Currency volatility** - USD, GBP, EUR rates shift while waiting to get paid

## The Solution

FreelanceOS is a full-stack freelancer management platform that combines:

- A **professional dashboard** for client, project, and invoice management
- **Raenest-powered payment links** embedded directly in invoices - one click for clients to pay internationally
- **Analytics** that show earnings trends, overdue risk, and upcoming deadlines at a glance

---

## Features

| Feature | Description |
|---|---|
| **Client Management** | Store contacts, track communication history, see total billed per client |
| **Project Tracking** | Budgets, deadlines, milestone-based payments, status pipeline |
| **Smart Invoicing** | Auto-numbered invoices, line items, PDF-ready, status tracking (draft → sent → paid → overdue) |
| **Raenest Integration** | One-click international payment links on every invoice |
| **Analytics Dashboard** | Earnings trends, revenue charts, client breakdown, upcoming deadlines |
| **Proposal Builder** | Create, send, and track proposal acceptance rates |
| **Activity Feed** | Real-time log of payments received, milestones hit, and new clients |
| **Dark Mode** | Full dark/light mode - work comfortably at any hour |
| **Mobile Responsive** | Full functionality on any screen size |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.0 (strict mode) |
| **Styling** | Tailwind CSS 4.0, shadcn/ui |
| **API Layer** | Axios with JWT interceptors, mock/real toggle via env variable |
| **Auth** | JWT - Bearer token, stored in localStorage |
| **Backend** | Node.js + Express + Prisma (see [backend repo](https://github.com/Sallah10/frealanceOs-Api)) |
| **Database** | PostgreSQL via Neon |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Git

### 1. Clone and install

```bash
git clone https://github.com/Sallah10/FreelanceOS.git
cd FreelanceOs
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Backend API URL
# Local dev:
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
# Production (your deployed backend):
# NEXT_PUBLIC_API_URL=https://frealanceos-api.onrender.com/api/v1

# Set to "false" to use the real backend, "true" for mock data
NEXT_PUBLIC_USE_MOCK=true
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Running with mock data?** Set `NEXT_PUBLIC_USE_MOCK=true` - the app works fully without a backend connection. This is the default.

### 4. Connect to the real backend

Once the backend is running (locally or deployed):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

Login with the demo account or click on the "View demo" button:
```
Email:    demo@freelanceos.dev
Password: Demo@12345
```

---

## Project Structure

```
freelanceos/
├── app/                        # Next.js App Router pages
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── clients/            # Client management
│   │   ├── projects/           # Project tracking
│   │   ├── invoices/           # Invoice management
│   │   ├── proposals/          # Proposal builder
│   │   └── settings/           # User settings
│   ├── (marketing)/            # Public pages
│   │   ├── page.tsx            # Landing page
│   │   └── docs/               # API documentation
│   └── layout.tsx
├── components/
│   ├── ui/                     # Base UI components (shadcn/ui)
│   ├── dashboard/              # Dashboard-specific components
│   ├── clients/                # Client components
│   ├── invoices/               # Invoice components
│   └── marketing-nav.tsx       # Public navigation
├── lib/
│   └── api.ts                  # API layer (mock/real toggle)
├── types/
│   └── index.ts                # Shared TypeScript types
├── public/
│   └── screenshots/            # App screenshots
└── .env.example
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `http://localhost:5000/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_USE_MOCK` | ❌ No | `true` | `"false"` to use real backend |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

This frontend is deployed on **Vercel**.

To deploy your own instance:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   NEXT_PUBLIC_USE_MOCK=false
   ```
4. Click **Deploy**

> The backend must be deployed and running before setting `NEXT_PUBLIC_USE_MOCK=false`. See the [backend repo](#) for backend deployment instructions.

---

## Related

- **[Backend Repository](https://github.com/Sallah10/frealanceOs-Api)** — Node.js + Express + Prisma API
- **[API Documentation](https://freelance-os-ten.vercel.app/docs)** — Full endpoint reference
- **[Live Demo](https://freelance-os-ten.vercel.app/)** — Try it now

---

## Acknowledgments

- [DevCareer](https://devcareer.io) for organizing the hackathon
- [Raenest](https://raenest.com) for the payment infrastructure
- Every African freelancer who shared their workflow pain points

---

<div align="center">

Built with 🖤 for African freelancers · [DevCareer × Raenest Hackathon 2026](https://devcareer.io)

</div>
