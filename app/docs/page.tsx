/* eslint-disable @typescript-eslint/no-unused-vars */
import { MarketingNav } from "@/components/marketing-nav";
// import Link from "next/link";

export default function DocsPage() {
    return (
        <>
            <MarketingNav />
            <div className="min-h-screen" style={{ background: "oklch(0.10 0.02 250)" }}>
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">API Documentation</h1>
                        <p className="text-white/40 mt-2">
                            Complete reference for the FreelanceOS backend API
                        </p>
                    </div>

                    <div className="space-y-12">
                        {/* Introduction */}
                        <Section title="Introduction">
                            <p className="text-white/60 leading-relaxed">
                                FreelanceOS API is a RESTful backend built for African freelancers to manage clients,
                                projects, invoices, and receive international payments via Raenest. Every endpoint
                                follows a consistent response format and requires JWT authentication for protected routes.
                            </p>
                        </Section>

                        {/* Base URL */}
                        <Section title="Base URL">
                            <CodeBlock>
                                https://freelanceos-api.onrender.com/api/v1
                            </CodeBlock>
                            <p className="text-white/60 mt-2">
                                For local development: <code className="text-brand">http://localhost:5000/api/v1</code>
                            </p>
                        </Section>

                        {/* Authentication */}
                        <Section title="Authentication">
                            <p className="text-white/60 leading-relaxed mb-4">
                                Most endpoints require a JWT token. Include it in the Authorization header:
                            </p>
                            <CodeBlock>
                                Authorization: Bearer your_jwt_token_here
                            </CodeBlock>
                            <p className="text-white/60 mt-4">
                                Tokens expire after 7 days. Obtain a token via <code className="text-brand">POST /auth/login</code> or{" "}
                                <code className="text-brand">POST /auth/register</code>.
                            </p>
                        </Section>

                        {/* Response Format */}
                        <Section title="Response Format">
                            <p className="text-white/60 mb-2">All responses follow this structure:</p>
                            <CodeBlock language="json">
                                {`{
  "success": true,
  "data": { ... }
}`}
                            </CodeBlock>
                            <p className="text-white/60 mt-2">Error responses:</p>
                            <CodeBlock language="json">
                                {`{
  "success": false,
  "error": "Human-readable error message"
}`}
                            </CodeBlock>
                        </Section>

                        {/* Endpoints */}
                        <Section title="Authentication Endpoints">
                            <Endpoint
                                method="POST"
                                path="/auth/register"
                                description="Create a new user account"
                                request={`{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}`}
                                response={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}`}
                            />

                            <Endpoint
                                method="POST"
                                path="/auth/login"
                                description="Authenticate and receive JWT token"
                                request={`{
  "email": "user@example.com",
  "password": "SecurePass123"
}`}
                                response={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}`}
                            />

                            <Endpoint
                                method="GET"
                                path="/auth/me"
                                description="Get current user profile"
                                requiresAuth
                                response={`{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "currency": "USD",
    "timezone": "Africa/Lagos"
  }
}`}
                            />
                        </Section>

                        <Section title="Clients">
                            <Endpoint
                                method="GET"
                                path="/clients"
                                description="List all clients for authenticated user"
                                requiresAuth
                                response={`{
  "success": true,
  "data": [...],
  "total": 5,
  "page": 1,
  "pageSize": 10
}`}
                            />

                            <Endpoint
                                method="POST"
                                path="/clients"
                                description="Create a new client"
                                requiresAuth
                                request={`{
  "name": "TechStart Nigeria",
  "email": "hello@techstart.ng",
  "company": "TechStart Nigeria Ltd",
  "phone": "+234 802 345 6789",
  "country": "NG"
}`}
                            />

                            <Endpoint
                                method="PUT"
                                path="/clients/:id"
                                description="Update an existing client"
                                requiresAuth
                            />

                            <Endpoint
                                method="DELETE"
                                path="/clients/:id"
                                description="Delete a client (only if no active projects)"
                                requiresAuth
                            />
                        </Section>

                        <Section title="Projects">
                            <Endpoint
                                method="GET"
                                path="/projects"
                                description="List all projects with optional filters"
                                requiresAuth
                                query="?status=active&clientId=client_123"
                            />

                            <Endpoint
                                method="POST"
                                path="/projects"
                                description="Create a new project"
                                requiresAuth
                                request={`{
  "clientId": "client_123",
  "name": "E-commerce Redesign",
  "description": "Complete website overhaul",
  "budget": 4500,
  "currency": "USD",
  "status": "planning",
  "deadline": "2026-04-15T00:00:00Z"
}`}
                            />
                        </Section>

                        <Section title="Invoices">
                            <Endpoint
                                method="GET"
                                path="/invoices"
                                description="List invoices with status filtering"
                                requiresAuth
                            />

                            <Endpoint
                                method="POST"
                                path="/invoices"
                                description="Create a new invoice (auto-generates invoice number)"
                                requiresAuth
                                request={`{
  "clientId": "client_123",
  "amount": 2250,
  "currency": "USD",
  "dueDate": "2026-04-15T00:00:00Z",
  "items": [
    { "description": "UI Design", "quantity": 1, "rate": 1500 },
    { "description": "Development", "quantity": 1, "rate": 750 }
  ],
  "notes": "Payment due within 15 days"
}`}
                            />

                            <Endpoint
                                method="POST"
                                path="/invoices/:id/send"
                                description="Mark invoice as sent (changes status from draft to sent)"
                                requiresAuth
                            />

                            <Endpoint
                                method="POST"
                                path="/invoices/:id/mark-paid"
                                description="Mark invoice as paid (updates client total billed)"
                                requiresAuth
                            />

                            <Endpoint
                                method="POST"
                                path="/invoices/:id/payment-link"
                                description="Generate Raenest payment link (placeholder)"
                                requiresAuth
                                response={`{
  "success": true,
  "data": {
    "link": "https://pay.raenest.com/fos-inv_123-abc123"
  }
}`}
                            />
                        </Section>

                        <Section title="Dashboard">
                            <Endpoint
                                method="GET"
                                path="/dashboard/stats"
                                description="Get key business metrics"
                                requiresAuth
                                response={`{
  "success": true,
  "data": {
    "totalEarnings": 45250.75,
    "monthlyEarnings": 8750.5,
    "earningsGrowth": 23.5,
    "activeProjects": 4,
    "pendingInvoices": 3,
    "pendingInvoicesAmount": 12500,
    "overdueInvoices": 1,
    "overdueInvoicesAmount": 6500,
    "upcomingDeadlines": [...]
  }
}`}
                            />

                            <Endpoint
                                method="GET"
                                path="/dashboard/earnings"
                                description="Get earnings over time (monthly/weekly)"
                                requiresAuth
                                query="?period=monthly"
                            />

                            <Endpoint
                                method="GET"
                                path="/dashboard/activity"
                                description="Get recent activity feed"
                                requiresAuth
                                query="?limit=20"
                            />
                        </Section>

                        {/* Error Codes */}
                        <Section title="Error Codes">
                            <div className="space-y-2">
                                <ErrorCode code="400" meaning="Bad Request — Validation error, missing required field" />
                                <ErrorCode code="401" meaning="Unauthorized — Missing or invalid JWT token" />
                                <ErrorCode code="403" meaning="Forbidden — Authenticated but no permission (trying to access another user's data)" />
                                <ErrorCode code="404" meaning="Not Found — Resource doesn't exist" />
                                <ErrorCode code="429" meaning="Too Many Requests — Rate limit exceeded" />
                                <ErrorCode code="500" meaning="Internal Server Error — Something broke on our end" />
                            </div>
                        </Section>

                        {/* Rate Limits */}
                        <Section title="Rate Limits">
                            <p className="text-white/60">
                                All endpoints are rate-limited to <strong className="text-white">100 requests per 15 minutes</strong> per IP address.
                                The response headers include:
                            </p>
                            <ul className="list-disc list-inside text-white/60 mt-2 space-y-1">
                                <li><code className="text-brand">X-RateLimit-Limit</code> — Maximum requests allowed</li>
                                <li><code className="text-brand">X-RateLimit-Remaining</code> — Requests remaining in window</li>
                                <li><code className="text-brand">X-RateLimit-Reset</code> — Time when window resets</li>
                            </ul>
                        </Section>

                        {/* Environment Variables */}
                        <Section title="Environment Variables">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-white/10">
                                        <tr>
                                            <th className="text-left py-2">Variable</th>
                                            <th className="text-left py-2">Required</th>
                                            <th className="text-left py-2">Default</th>
                                            <th className="text-left py-2">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr>
                                            <td className="py-2 font-mono text-xs">DATABASE_URL</td>
                                            <td className="py-2">✅ Yes</td>
                                            <td className="py-2">-</td>
                                            <td className="py-2">PostgreSQL connection string</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-xs">JWT_SECRET</td>
                                            <td className="py-2">✅ Yes</td>
                                            <td className="py-2">-</td>
                                            <td className="py-2">Secret for signing JWTs (min 32 chars)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-xs">PORT</td>
                                            <td className="py-2">❌ No</td>
                                            <td className="py-2">5000</td>
                                            <td className="py-2">Server port</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-xs">FRONTEND_URL</td>
                                            <td className="py-2">❌ No</td>
                                            <td className="py-2">http://localhost:3000</td>
                                            <td className="py-2">CORS allowed origin</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        {/* JWT Secret Generation */}
                        <Section title="Generate JWT Secret">
                            <p className="text-white/60 mb-3">Run one of these commands to generate a secure JWT secret:</p>
                            <CodeBlock>
                                # Linux/macOS/Git Bash
                                node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(48).toString(&apos;hex&apos;))&quot;

                                # Using OpenSSL
                                openssl rand -hex 48

                                # Windows PowerShell
                                [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
                            </CodeBlock>
                        </Section>

                        {/* Footer */}
                        <div className="pt-8 border-t border-white/10">
                            <p className="text-xs text-white/30">
                                Built for the DevCareer × Raenest Hackathon 2026. Need help? Open an issue on
                                <a href="https://github.com/Sallah10/FreelanceOS/issues">
                                    <span className="underline hover:text-brand ml-1">GitHub</span>
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
            {children}
        </div>
    );
}


function CodeBlock({ children, language = "bash" }: { children: React.ReactNode; language?: string }) {
    return (
        <pre className="bg-black/30 rounded-xl p-4 overflow-x-auto text-sm font-mono text-green-400 border border-white/10">
            {children}
        </pre>
    );
}

function Endpoint({
    method,
    path,
    description,
    requiresAuth = false,
    request,
    response,
    query,
}: {
    method: string;
    path: string;
    description: string;
    requiresAuth?: boolean;
    request?: string;
    response?: string;
    query?: string;
}) {
    return (
        <div className="mb-6 border-l-2 border-brand pl-4">
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${method === "GET" ? "bg-green-500/20 text-green-400" :
                    method === "POST" ? "bg-blue-500/20 text-blue-400" :
                        method === "PUT" ? "bg-yellow-500/20 text-yellow-400" :
                            method === "DELETE" ? "bg-red-500/20 text-red-400" :
                                "bg-gray-500/20 text-gray-400"
                    }`}>
                    {method}
                </span>
                <code className="text-brand text-sm">{path}</code>
                {requiresAuth && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">🔒 Auth required</span>
                )}
                {query && (
                    <span className="text-xs text-white/40">?{query}</span>
                )}
            </div>
            <p className="text-white/60 text-sm mb-3">{description}</p>
            {request && (
                <div className="mb-2">
                    <p className="text-xs text-white/40 mb-1">Request:</p>
                    <CodeBlock language="json">{request}</CodeBlock>
                </div>
            )}
            {response && (
                <div>
                    <p className="text-xs text-white/40 mb-1">Response:</p>
                    <CodeBlock language="json">{response}</CodeBlock>
                </div>
            )}
        </div>
    );
}

function ErrorCode({ code, meaning }: { code: string; meaning: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-red-400 w-12">{code}</span>
            <span className="text-white/60 text-sm">{meaning}</span>
        </div>
    );
}