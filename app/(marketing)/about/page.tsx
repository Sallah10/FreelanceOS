"use client";

import { MarketingNav } from "@/components/marketing-nav";
import { Users, Zap, Heart, Globe, Target, Rocket } from "lucide-react";
import Link from "next/link";

const values = [
    {
        icon: Users,
        title: "Built for African Freelancers",
        description: "We understand the unique challenges African freelancers face — from international payments to client trust. Every feature is designed with you in mind.",
    },
    {
        icon: Zap,
        title: "Speed First",
        description: "No waiting days for payment links. No slow dashboards. FreelanceOS is built to be fast, because your time is money.",
    },
    {
        icon: Heart,
        title: "Community-Driven",
        description: "Built by freelancers, for freelancers. We're constantly iterating based on what the community actually needs.",
    },
    {
        icon: Globe,
        title: "Global, Local",
        description: "Get paid in international currencies while keeping the local experience that feels like home. Raenest handles the complexity.",
    },
];

const team = [
    {
        name: "Bello",
        role: "Frontend Architect",
        bio: "Freelancer who built tools he wished existed. 5+ years shipping production apps.",
    },
    {
        name: "Tunde",
        role: "Backend Engineer",
        bio: "Passionate about security and scaling systems that serve African creators.",
    },
];

export default function AboutPage() {
    return (
        <>
            <MarketingNav />
            <div className="min-h-screen" style={{ background: "oklch(0.10 0.02 250)" }}>

                <div className=" px-6 py-16 md:py-24">
                    {/* Hero */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            We&apos;re on a mission to help
                            <br />
                            <span style={{ color: "#2563EB" }}>African freelancers win globally</span>
                        </h1>
                        <p className="text-white/40 max-w-2xl mx-auto text-lg">
                            FreelanceOS started as a hackathon project and became a movement.
                            We&apos;re building the command center freelancers deserve.
                        </p>
                    </div>

                    {/* Story Section */}
                    <div className="grid md:grid-cols-2 gap-12 mb-24">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">The Story</h2>
                            <p className="text-white/60 leading-relaxed mb-4">
                                In 2025, we saw a problem: African freelancers were winning international work but struggling with the backend — invoicing, payments, client management. Existing tools were built for US/EU markets and didn&apos;t fit.
                            </p>
                            <p className="text-white/60 leading-relaxed mb-4">
                                So we built FreelanceOS. A tool that combines client management, project tracking, and instant invoices with Raenest payment links. All in one place.
                            </p>
                            <p className="text-white/60 leading-relaxed">
                                Now, thousands of freelancers across Nigeria, Kenya, Ghana, and beyond use FreelanceOS to get paid faster and manage their business better.
                            </p>
                        </div>
                        <div className="rounded-2xl p-8" style={{ background: "oklch(0.14 0.025 250)", border: "1px solid oklch(1 0 0 / 8%)" }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-5 h-5 text-brand" />
                                <span className="text-sm font-semibold">Our Mission</span>
                            </div>
                            <p className="text-white/60 leading-relaxed">
                                Empower 1 million African freelancers to build sustainable businesses by providing world-class tools that make international work seamless and profitable.
                            </p>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="mb-24">
                        <h2 className="text-2xl font-bold text-center mb-12">What Drives Us</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value) => {
                                const Icon = value.icon;
                                return (
                                    <div
                                        key={value.title}
                                        className="rounded-2xl p-6 text-center"
                                        style={{ background: "oklch(0.14 0.025 250)", border: "1px solid oklch(1 0 0 / 8%)" }}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-6 h-6 text-brand" />
                                        </div>
                                        <h3 className="font-semibold mb-2">{value.title}</h3>
                                        <p className="text-sm text-white/40">{value.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Team */}
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-12">Built by Freelancers</h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {team.map((member) => (
                                <div
                                    key={member.name}
                                    className="rounded-2xl p-6 flex items-start gap-4"
                                    style={{ background: "oklch(0.14 0.025 250)", border: "1px solid oklch(1 0 0 / 8%)" }}
                                >
                                    <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-brand">{member.name[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{member.name}</h3>
                                        <p className="text-xs text-brand mb-2">{member.role}</p>
                                        <p className="text-sm text-white/40">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16 pt-8">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            Join the community
                            <Rocket className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}