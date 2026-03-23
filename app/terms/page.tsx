import { Zap } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
                    <span className="text-white/60">Terms of Service</span>
                </div>

                <div className="space-y-8">
                    <h1 className="text-3xl font-bold">Terms of Service</h1>
                    <p className="text-white/40">Last updated: March 2026</p>

                    <div className="space-y-6">
                        <Section title="1. Acceptance of Terms">
                            <p>By accessing or using FreelanceOS, you agree to be bound by these Terms of Service. If you disagree with any part, you may not access the service.</p>
                        </Section>

                        <Section title="2. Description of Service">
                            <p>FreelanceOS is a command center for freelancers to manage clients, track projects, generate invoices, and receive payments via Raenest. The service is currently in hackathon demo mode.</p>
                        </Section>

                        <Section title="3. User Accounts">
                            <p>You are responsible for maintaining the security of your account. You agree to:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>Provide accurate and complete information</li>
                                <li>Keep your password secure</li>
                                <li>Notify us immediately of unauthorized access</li>
                                <li>Be liable for all activity under your account</li>
                            </ul>
                        </Section>

                        <Section title="4. Acceptable Use">
                            <p>You agree not to:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                                <li>Use the service for illegal purposes</li>
                                <li>Attempt to bypass security measures</li>
                                <li>Interfere with the service&apos;s operation</li>
                                <li>Access data belonging to other users</li>
                            </ul>
                        </Section>

                        <Section title="5. Payment and Raenest Integration">
                            <p>FreelanceOS is currently free during the hackathon. Raenest transaction fees apply separately and are governed by Raenest&apos;s terms. You must connect your Raenest account to receive payments.</p>
                        </Section>

                        <Section title="6. Intellectual Property">
                            <p>The FreelanceOS name, logo, and code are owned by the hackathon contributors. You retain ownership of all data you input into the service.</p>
                        </Section>

                        <Section title="7. Termination">
                            <p>We may suspend or terminate your access at any time for violations of these terms. You may delete your account at any time via Settings.</p>
                        </Section>

                        <Section title="8. Disclaimer of Warranties">
                            <p>The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted or error-free operation. This is a hackathon project, not a production service.</p>
                        </Section>

                        <Section title="9. Limitation of Liability">
                            <p>To the fullest extent permitted by law, FreelanceOS shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                        </Section>

                        <Section title="10. Contact">
                            <p>Questions? Contact us at: <a href="mailto:legal@freelanceos.dev" className="text-brand hover:underline">legal@freelanceos.dev</a></p>
                        </Section>
                    </div>

                    <p className="text-xs text-white/30 pt-8 border-t border-white/10">
                        FreelanceOS is built for the DevCareer x Raenest Hackathon. These terms apply to demo purposes only.
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