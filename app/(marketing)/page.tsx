"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  FileText,
  Users,
  BarChart3,
  Shield,
  ChevronRight,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// ─── Typewriter cycling words ─────────────────────────────────────
const CYCLE_WORDS = ["invoices", "clients", "payments", "projects", "proposals"];

function TypewriterCycle() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const current = CYCLE_WORDS[wordIndex];

    // Function to update the displayed text
    const updateText = () => {
      if (!isDeleting && displayed === current) {
        // Pause at full word
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, 1800);
        return;
      }

      if (isDeleting && displayed === "") {
        // Word is fully deleted, move to next word
        setWordIndex((i) => (i + 1) % CYCLE_WORDS.length);
        setIsDeleting(false);
        return;
      }

      const speed = isDeleting ? 60 : 100;
      timeoutRef.current = setTimeout(() => {
        setDisplayed(
          isDeleting
            ? current.slice(0, displayed.length - 1)
            : current.slice(0, displayed.length + 1)
        );
      }, speed);
    };

    updateText();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayed, isDeleting, wordIndex]);

  return (
    <span className="relative">
      <span className="text-[#3B82F6]">{displayed}</span>
      <span className="ml-0.5 inline-block w-0.5 h-[0.9em] bg-[#3B82F6] align-middle animate-pulse" />
    </span>
  );
}

// ─── Animated counter ─────────────────────────────────────────────
function AnimatedCounter({ end, prefix = "", suffix = "", duration = 2000 }: {
  end: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Mini Dashboard Preview (hero mockup) ─────────────────────────
function DashboardPreview() {
  return (
    <div
      className="relative w-full max-w-130 rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.14 0.025 250)",
        border: "1px solid oklch(1 0 0 / 8%)",
        boxShadow: "0 40px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 4%)",
      }}
    >
      {/* Topbar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 6%)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#2563EB] flex items-center justify-center">
            <Zap className="w-3 h-3 text-white fill-current" />
          </div>
          <span className="text-xs font-semibold text-white/80">FreelanceOS</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Earned", value: "$45,250", up: true, color: "#3B82F6" },
            { label: "Active Projects", value: "4", up: true, color: "#10B981" },
            { label: "Overdue", value: "1", up: false, color: "#F59E0B" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 space-y-1"
              style={{ background: "oklch(0.18 0.02 250)" }}
            >
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
              <p className="text-base font-bold font-mono text-white">{s.value}</p>
              <div className="flex items-center gap-1">
                <TrendingUp
                  className="w-2.5 h-2.5"
                  style={{ color: s.up ? "#10B981" : "#F59E0B" }}
                />
                <span className="text-[9px]" style={{ color: s.up ? "#10B981" : "#F59E0B" }}>
                  {s.up ? "+23.5%" : "Action needed"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div
          className="rounded-xl p-4"
          style={{ background: "oklch(0.18 0.02 250)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/60">Earnings Trend</span>
            <span className="text-[10px] text-white/30">6 months</span>
          </div>
          {/* Fake sparkline */}
          <svg viewBox="0 0 240 60" className="w-full" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 50 C20 45, 40 38, 60 32 S90 28, 110 22 S150 14, 170 12 S210 6, 240 4"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0 50 C20 45, 40 38, 60 32 S90 28, 110 22 S150 14, 170 12 S210 6, 240 4 L240 60 L0 60Z"
              fill="url(#sg)"
            />
          </svg>
        </div>

        {/* Invoice row */}
        <div className="space-y-2">
          {[
            { name: "TechStart Nigeria", amount: "$2,250", status: "paid", statusColor: "#10B981" },
            { name: "DesignCo", amount: "$4,000", status: "sent", statusColor: "#F59E0B" },
            { name: "Kirkland Digital", amount: "$6,500", status: "overdue", statusColor: "#EF4444" },
          ].map((inv) => (
            <div
              key={inv.name}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "oklch(0.18 0.02 250)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: "#2563EB" }}
                >
                  {inv.name[0]}
                </div>
                <span className="text-xs text-white/70">{inv.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: `${inv.statusColor}18`,
                    color: inv.statusColor,
                  }}
                >
                  {inv.status}
                </span>
                <span className="text-xs font-mono font-semibold text-white">{inv.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raenest badge */}
      <div
        className="flex items-center justify-center gap-2 py-2.5 text-xs text-white/30"
        style={{ borderTop: "1px solid oklch(1 0 0 / 6%)" }}
      >
        <span>Payments powered by</span>
        <span className="font-semibold text-white/50">Raenest</span>
      </div>
    </div>
  );
}

// ─── Feature cards ────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileText,
    title: "Smart Invoicing",
    description:
      "Generate professional invoices in seconds. Attach Raenest payment links so clients can pay from anywhere in the world.",
    accent: "#3B82F6",
  },
  {
    icon: Globe,
    title: "International Payments",
    description:
      "Receive USD, GBP, EUR directly into your Raenest account. No friction, no delays. African talent, global rates.",
    accent: "#10B981",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep every client's history, contact info, and project timeline in one place. Never lose track of a conversation.",
    accent: "#F59E0B",
  },
  {
    icon: BarChart3,
    title: "Earnings Analytics",
    description:
      "See exactly where your money comes from. Monthly trends, top clients, project ROI — data that drives decisions.",
    accent: "#8B5CF6",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "JWT authentication, rate limiting, Row Level Security on every query. Your data is yours — no exceptions.",
    accent: "#EC4899",
  },
  {
    icon: Zap,
    title: "Proposal → Invoice",
    description:
      "Convert an accepted proposal into an invoice in one click. The entire pipeline lives in FreelanceOS.",
    accent: "#F97316",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I sent my first international invoice and got paid in 2 hours. This is what African freelancers have needed.",
    name: "Taiwo A.",
    role: "UI/UX Designer, Lagos",
    initials: "TA",
    color: "#3B82F6",
  },
  {
    quote: "The Raenest integration alone makes it worth it. No more payment link hunting — it's right there in the invoice.",
    name: "Chinonso E.",
    role: "Full Stack Developer, Enugu",
    initials: "CE",
    color: "#10B981",
  },
  {
    quote: "Finally something that understands how we work — multiple clients, overlapping projects, international rates.",
    name: "Amara K.",
    role: "Brand Designer, Abuja",
    initials: "AK",
    color: "#F59E0B",
  },
];

// ─── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "oklch(0.10 0.02 250)", color: "oklch(0.95 0.005 250)" }}
    >
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{
          background: "oklch(0.10 0.02 250 / 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 6%)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="font-bold text-sm tracking-tight">FreelanceOS</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          {["Features", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 text-sm font-medium bg-[#2563EB] hover:bg-[#1d4fd8] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative px-6 pt-24 pb-32 md:px-12 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, #2563EB 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: "oklch(0.18 0.04 264)",
                border: "1px solid oklch(0.35 0.1 264)",
                color: "#93C5FD",
              }}
            >
              <Star className="w-3 h-3 fill-current" />
              Built for the DevCareer × Raenest Hackathon
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-center text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            The command center
            <br />
            for your{" "}
            <TypewriterCycle />
          </h1>

          <p className="text-center text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            African freelancers deserve world-class tools. Manage clients, track
            projects, and get paid internationally — all powered by Raenest.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4fd8] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-white font-medium px-6 py-3 rounded-xl transition-colors"
              style={{ border: "1px solid oklch(1 0 0 / 10%)" }}
            >
              View demo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social proof micro-text */}
          <p className="text-center text-xs text-white/25 mt-6">
            No credit card required · Free during hackathon · Raenest payments included
          </p>

          {/* Hero mockup */}
          <div className="flex justify-center mt-16">
            <div className="relative">
              {/* Glow behind card */}
              <div
                className="absolute -inset-8 opacity-20 rounded-3xl"
                style={{
                  background: "radial-gradient(ellipse, #2563EB 0%, transparent 70%)",
                  filter: "blur(30px)",
                }}
              />
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div
        style={{
          borderTop: "1px solid oklch(1 0 0 / 6%)",
          borderBottom: "1px solid oklch(1 0 0 / 6%)",
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px">
          {[
            { label: "Invoices Generated", end: 1240, suffix: "+" },
            { label: "Avg. Invoice Value", end: 3200, prefix: "$" },
            { label: "Currencies Supported", end: 6, suffix: "" },
            { label: "Payment Success Rate", end: 98, suffix: "%" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
              style={{ background: "oklch(0.13 0.02 250)" }}
            >
              <span
                className="text-3xl font-bold font-mono mb-1"
                style={{ color: "#3B82F6" }}
              >
                <AnimatedCounter end={s.end} prefix={s.prefix} suffix={s.suffix} />
              </span>
              <span className="text-xs text-white/35 uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for how African freelancers actually work
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
              Not another generic SaaS. FreelanceOS is designed around the realities
              of working internationally from Africa.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl p-6 transition-all hover:scale-[1.01]"
                  style={{
                    background: "oklch(0.14 0.025 250)",
                    border: "1px solid oklch(1 0 0 / 6%)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${f.accent}18`, color: f.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Raenest integration spotlight ── */}
      <section
        className="px-6 py-24 md:px-12"
        style={{ background: "oklch(0.13 0.025 250)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: text */}
            <div className="flex-1 space-y-6">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "oklch(0.20 0.06 264)",
                  border: "1px solid oklch(0.35 0.1 264)",
                  color: "#93C5FD",
                }}
              >
                <Globe className="w-3 h-3" />
                Raenest Integration
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Get paid from anywhere.
                <br />
                <span style={{ color: "#3B82F6" }}>In any currency.</span>
              </h2>

              <p className="text-white/45 leading-relaxed">
                Every invoice you create in FreelanceOS can carry a Raenest payment link.
                Your client clicks it, pays in their currency — you receive it in yours.
                USD, GBP, EUR, NGN. No banking friction, no delays.
              </p>

              <ul className="space-y-3">
                {[
                  "Auto-generated Raenest payment links on invoices",
                  "Multi-currency: USD, GBP, EUR, NGN, KES, GHS",
                  "Receive Upwork earnings via Raenest in under 1 hour",
                  "USDC & USDT stablecoin support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4fd8] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Connect Raenest
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Right: payment card mockup */}
            <div className="shrink-0 w-full max-w-sm">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "oklch(0.14 0.025 250)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  boxShadow: "0 20px 40px oklch(0 0 0 / 0.4)",
                }}
              >
                {/* Invoice header */}
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid oklch(1 0 0 / 6%)" }}
                >
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider">Invoice</p>
                    <p className="font-mono text-sm font-semibold text-white">INV-2026-002</p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "#F59E0B18", color: "#F59E0B" }}
                  >
                    Awaiting payment
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Amount */}
                  <div className="text-center py-4">
                    <p className="text-xs text-white/30 mb-1">Amount Due</p>
                    <p className="text-4xl font-bold font-mono text-white">$4,000</p>
                    <p className="text-xs text-white/30 mt-1">Due Mar 25, 2026</p>
                  </div>

                  {/* Line items */}
                  <div className="space-y-2">
                    {[
                      { desc: "App Development — Sprint 1", amount: "$2,500" },
                      { desc: "QA & Testing", amount: "$1,500" },
                    ].map((item) => (
                      <div key={item.desc} className="flex items-center justify-between">
                        <span className="text-xs text-white/45">{item.desc}</span>
                        <span className="text-xs font-mono text-white/70">{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pay button */}
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: "#2563EB", color: "#fff" }}
                  >
                    <DollarSign className="w-4 h-4" />
                    Pay via Raenest
                  </button>

                  <p className="text-center text-[10px] text-white/20">
                    Secure payment powered by Raenest · 190+ countries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-24 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] mb-3">
              Freelancers love it
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Built for people like you</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 space-y-4"
                style={{
                  background: "oklch(0.14 0.025 250)",
                  border: "1px solid oklch(1 0 0 / 6%)",
                }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-current"
                      style={{ color: "#F59E0B" }}
                    />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-white/35">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: "oklch(0.14 0.025 250)",
              border: "1px solid oklch(1 0 0 / 8%)",
            }}
          >
            {/* Background glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, #2563EB 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Your freelance business,
                <br />
                finally under control.
              </h2>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Join African freelancers who are getting paid internationally
                without the headache. Set up in under 5 minutes.
              </p>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4fd8] text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                Create your free account
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-xs text-white/20 mt-4">
                No credit card required · Raenest payments built in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-10 md:px-12"
        style={{ borderTop: "1px solid oklch(1 0 0 / 6%)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#2563EB] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="text-sm font-semibold text-white/60">FreelanceOS</span>
          </div>

          <p className="text-xs text-white/25 text-center">
            Built for the DevCareer × Raenest Hackathon 2026 · Payments powered by{" "}
            <a
              href="https://raenest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              Raenest
            </a>
          </p>

          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}