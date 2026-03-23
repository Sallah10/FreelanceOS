import { Zap } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen" style={{ background: "oklch(0.10 0.02 250)" }}>
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="font-bold text-white">FreelanceOS</span>
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="text-white/60">Privacy Policy</span>
                </div>

                <div className="space-y-8">
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                    <p className="text-white/40">Last updated: March 2026</p>

                    <div className="space-y-6">
                        <Section title="1. Information We Collect">
                            <p>We collect information you provide directly to us, such as when you create an account, fill out a form, or communicate with us. This may include:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>Name and contact information (email, phone)</li>
                                <li>Account credentials (password is hashed)</li>
                                <li>Client and project data you input</li>
                                <li>Payment information processed via Raenest</li>
                            </ul>
                        </Section>

                        <Section title="2. How We Use Your Information">
                            <p>We use your information to:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>Provide, maintain, and improve FreelanceOS</li>
                                <li>Process payments via Raenest integration</li>
                                <li>Send you technical notices and support messages</li>
                                <li>Respond to your comments and questions</li>
                            </ul>
                        </Section>

                        <Section title="3. Data Security">
                            <p>We implement industry-standard security measures including:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>JWT authentication with secure token storage</li>
                                <li>Row Level Security (RLS) on all database tables</li>
                                <li>Rate limiting and CORS protection</li>
                                <li>All data encrypted in transit (TLS 1.3)</li>
                            </ul>
                        </Section>

                        <Section title="4. Sharing Your Information">
                            <p>We do not sell your personal data. We share information only:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>With Raenest to process payments (you must connect your account)</li>
                                <li>When required by law or to protect legal rights</li>
                                <li>With your explicit consent</li>
                            </ul>
                        </Section>

                        <Section title="5. Your Rights">
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>Access and export your data</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your account</li>
                                <li>Opt out of marketing communications</li>
                            </ul>
                        </Section>

                        <Section title="6. Contact Us">
                            <p>For privacy questions, contact us at: <a href="mailto:privacy@freelanceos.dev" className="text-brand hover:underline">privacy@freelanceos.dev</a></p>
                        </Section>
                    </div>

                    <p className="text-xs text-white/30 pt-8 border-t border-white/10">
                        FreelanceOS is built for the DevCareer x Raenest Hackathon. This privacy policy applies to demo purposes.
                    </p>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-3">{title}</h2>
            <div className="text-white/60 leading-relaxed">{children}</div>
        </div>
    );
}