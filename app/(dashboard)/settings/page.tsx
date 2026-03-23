"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import {
    cn,
    // formatCurrency/
} from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    Bell,
    CreditCard,
    Shield,
    // Globe,
    Zap,
    Save,
    Loader2,
    CheckCircle2,
    ExternalLink
} from "lucide-react";

type SettingsTab = "profile" | "notifications" | "billing" | "security";

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
        { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
        { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 p-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your account preferences and integrations
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 shrink-0">
                    <div className="sticky top-6 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    activeTab === tab.id
                                        ? "bg-brand/10 text-brand"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Profile Settings */}
                    {activeTab === "profile" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your personal information and how you appear to clients
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={user?.firstName}
                                            className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={user?.lastName}
                                            className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Default Currency
                                    </label>
                                    <select
                                        defaultValue={user?.currency || "USD"}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    >
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="NGN">NGN - Nigerian Naira</option>
                                        <option value="KES">KES - Kenyan Shilling</option>
                                        <option value="GHS">GHS - Ghanaian Cedi</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Timezone
                                    </label>
                                    <select
                                        defaultValue="Africa/Lagos"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    >
                                        <option value="Africa/Lagos">Lagos (WAT)</option>
                                        <option value="Africa/Nairobi">Nairobi (EAT)</option>
                                        <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                                        <option value="Africa/Casablanca">Casablanca (WEST)</option>
                                    </select>
                                </div>

                                <Button onClick={handleSave} disabled={saving} className="gap-2">
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    ) : saved ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Raenest Integration (Billing Tab) */}
                    {activeTab === "billing" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Raenest Integration</CardTitle>
                                <CardDescription>
                                    Connect your Raenest account to receive international payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div
                                    className="rounded-xl p-6 text-center space-y-4"
                                    style={{ background: "var(--brand-muted)", border: "1px solid var(--brand)/20" }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center mx-auto">
                                        <Zap className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Connect Raenest</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Get paid in USD, GBP, EUR, and more. Raenest handles currency conversion and payout to your local bank.
                                        </p>
                                    </div>
                                    <Button className="gap-2 bg-brand hover:bg-brand/90">
                                        Connect Raenest Account
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        After connecting, invoices will automatically include Raenest payment links
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium">Payment Settings</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded border-border" />
                                            <span className="text-sm">Auto-generate payment links on all invoices</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded border-border" />
                                            <span className="text-sm">Send payment reminders 3 days before due date</span>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notification Settings */}
                    {activeTab === "notifications" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Choose what updates you want to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: "Invoice paid", description: "When a client pays an invoice" },
                                    { label: "Payment link clicked", description: "When a client views your Raenest payment link" },
                                    { label: "Project deadline approaching", description: "3 days before a project deadline" },
                                    { label: "New proposal response", description: "When a client accepts or rejects a proposal" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Security Settings */}
                    {activeTab === "security" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>
                                    Manage your password and account security
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    />
                                </div>
                                <Button onClick={handleSave} disabled={saving} className="gap-2">
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                                    ) : saved ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Updated!</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Update Password</>
                                    )}
                                </Button>

                                <div className="pt-4 border-t border-border">
                                    <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <Button variant="destructive" size="sm">
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}