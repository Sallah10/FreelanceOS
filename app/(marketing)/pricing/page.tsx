"use client";

import Link from "next/link";
import {
    CheckCircle2, Zap, CreditCard, Globe,
    //  Users, FileText, 
    ArrowRight
} from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";

export default function PricingPage() {
    const features = [
        { name: "Client Management", included: true },
        { name: "Project Tracking", included: true },
        { name: "Invoice Generation", included: true },
        { name: "Proposal Builder", included: true },
        { name: "Analytics Dashboard", included: true },
        { name: "Multi-currency Support", included: true },
        { name: "Raenest Payment Links", included: true },
        { name: "Email Support", included: true },
        { name: "Priority Support", included: false, pro: true },
        { name: "Custom Branding", included: false, pro: true },
    ];

    return (
        <>
            <MarketingNav />
            <div className="min-h-screen" style={{ background: "oklch(0.10 0.02 250)" }}>

                <div className=" px-6 py-16 md:py-24">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "oklch(0.18 0.04 264)", border: "1px solid oklch(0.35 0.1 264)", color: "#93C5FD" }}
                        >
                            <Zap className="w-3 h-3" />
                            Simple, transparent pricing
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Built for African freelancers
                        </h1>
                        <p className="text-white/40 max-w-lg mx-auto">
                            Start free during the hackathon. Only pay Raenest transaction fees when you get paid.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div
                            className="rounded-2xl p-8 transition-all hover:scale-[1.01]"
                            style={{
                                background: "oklch(0.14 0.025 250)",
                                border: "1px solid oklch(1 0 0 / 8%)",
                            }}
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">Free</h2>
                                <p className="text-white/40 text-sm mt-1">For freelancers just starting out</p>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">$0</span>
                                    <span className="text-white/40"> / forever</span>
                                </div>
                            </div>

                            <Link
                                href="/register"
                                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-colors mb-8"
                            >
                                Get started
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <ul className="space-y-3">
                                {features.map((feature) => (
                                    <li key={feature.name} className="flex items-start gap-2.5 text-sm">
                                        {feature.included ? (
                                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                        ) : feature.pro ? (
                                            <div className="w-4 h-4 mt-0.5 shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 mt-0.5 shrink-0" />
                                        )}
                                        <span className={feature.included ? "text-white/80" : "text-white/30"}>
                                            {feature.name}
                                            {feature.pro && <span className="text-brand text-xs ml-1">(Pro)</span>}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div
                            className="rounded-2xl p-8 relative overflow-hidden transition-all hover:scale-[1.01]"
                            style={{
                                background: "oklch(0.14 0.025 250)",
                                border: "2px solid #2563EB",
                            }}
                        >
                            <div className="absolute top-4 right-4">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brand/20 text-brand">
                                    Coming Soon
                                </span>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">Pro</h2>
                                <p className="text-white/40 text-sm mt-1">For scaling freelancers & agencies</p>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">$19</span>
                                    <span className="text-white/40"> / month</span>
                                </div>
                                <p className="text-xs text-white/30 mt-1">or $190/year (save 17%)</p>
                            </div>

                            <button
                                disabled
                                className="w-full flex items-center justify-center gap-2 bg-brand/20 text-brand font-semibold py-3 rounded-xl cursor-not-allowed mb-8"
                            >
                                Join waitlist
                            </button>

                            <ul className="space-y-3">
                                {features.map((feature) => (
                                    <li key={feature.name} className="flex items-start gap-2.5 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                        <span className="text-white/80">{feature.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Raenest Fees Note */}
                    <div className="text-center mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                            <CreditCard className="md:w-4 md:h-4 w-6 h-6" />
                            <span>Raenest transaction fees apply separately. Free plan includes everything you need to get started.</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-white/40 mt-2">
                            <Globe className=" w-4 h-4" />
                            <span>Receive payments in USD, GBP, EUR, NGN, KES, GHS via Raenest</span>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}