"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { AuthAPI, NotificationsAPI } from "@/lib/api";
import type { CurrencyCode, NotificationPrefs } from "@/types";
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
    ExternalLink,
    Trash2
} from "lucide-react";

type SettingsTab = "profile" | "notifications" | "billing" | "security";

const NOTIFICATION_ITEMS: {
    key: keyof NotificationPrefs;
    label: string;
    description: string;
}[] = [
    { key: "invoicePaid", label: "Invoice paid", description: "When a client pays an invoice" },
    { key: "paymentLinkClicked", label: "Payment link clicked", description: "When a client views your payment link" },
    { key: "deadlineApproaching", label: "Project deadline approaching", description: "3 days before a project deadline" },
    { key: "proposalResponse", label: "New proposal response", description: "When a client accepts or rejects a proposal" },
];

const DEFAULT_PREFS: NotificationPrefs = {
    invoicePaid: true,
    paymentLinkClicked: true,
    deadlineApproaching: true,
    proposalResponse: true,
};

export default function SettingsPage() {
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
    const [prefsLoaded, setPrefsLoaded] = useState(false);
    const [prefsError, setPrefsError] = useState<string | null>(null);

    const [showDelete, setShowDelete] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        currency: "USD" as CurrencyCode,
        timezone: "Africa/Lagos",
    });
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // re-sync the form whenever the logged-in user changes (fresh login, or a
    // save from another tab). Guarded so it only runs on an actual change.
    const [syncedUser, setSyncedUser] = useState(user);
    if (user !== syncedUser) {
        setSyncedUser(user);
        if (user) {
            setProfile({
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email,
                currency: user.currency || "USD",
                timezone: user.timezone || "Africa/Lagos",
            });
        }
    }

    // Pull the saved notification prefs once, lazily when the tab is opened.
    if (activeTab === "notifications" && !prefsLoaded && !prefsError) {
        setPrefsLoaded(true);
        NotificationsAPI.list().then((res) => {
            if (res.success && res.data) {
                setPrefs(res.data.prefs);
            } else {
                setPrefsError(res.error ?? "Could not load your preferences.");
            }
        }).catch(() => setPrefsError("Could not load your preferences."));
    }

    const flashSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const togglePref = async (key: keyof NotificationPrefs) => {
        const next = { ...prefs, [key]: !prefs[key] };
        const previous = prefs;
        setPrefs(next);
        setPrefsError(null);
        const res = await AuthAPI.updateNotificationPrefs({ [key]: next[key] });
        if (!res.success || !res.data) {
            setPrefs(previous);
            setPrefsError(res.error ?? "Could not save that preference.");
            return;
        }
        setPrefs(res.data.notificationPrefs);
    };

    const handleDeleteAccount = async () => {
        setDeleteError(null);
        if (deleteConfirm !== "DELETE") {
            setDeleteError("Type DELETE to confirm.");
            return;
        }
        if (!deletePassword) {
            setDeleteError("Enter your password to confirm.");
            return;
        }
        setDeleting(true);
        const res = await AuthAPI.deleteAccount({
            password: deletePassword,
            confirm: "DELETE",
        });
        setDeleting(false);
        if (!res.success) {
            setDeleteError(res.error ?? "Could not delete your account.");
            return;
        }
        toast.success("Account deleted", {
            description: "Your data has been deactivated. Signing you out...",
        });
        setTimeout(() => logout(), 1200);
    };

    const handleSave = async () => {
        setProfileError(null);
        if (!profile.firstName.trim() || !profile.lastName.trim()) {
            setProfileError("First and last name are required.");
            return;
        }
        setSaving(true);
        const res = await AuthAPI.updateProfile({
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
            currency: profile.currency,
            timezone: profile.timezone,
        });
        setSaving(false);
        if (!res.success || !res.data) {
            setProfileError(res.error ?? "Could not save your profile. Try again.");
            return;
        }
        updateUser(res.data);
        toast.success("Profile updated", { description: "Your changes are live." });
        flashSaved();
    };

    const handleUpdatePassword = async () => {
        setPasswordError(null);
        const { currentPassword, newPassword, confirmPassword } = passwords;
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Fill in all three password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }
        setSaving(true);
        const res = await AuthAPI.updatePassword({ currentPassword, newPassword });
        setSaving(false);
        if (!res.success) {
            setPasswordError(res.error ?? "Could not update your password.");
            return;
        }
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password updated", { description: "Use it next time you sign in." });
        flashSaved();
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
        { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
        { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your account preferences and integrations
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-6 flex lg:flex-col gap-1 overflow-x-auto -webkit-overflow-scrolling-touch pb-1 lg:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0",
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
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                            className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
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
                                        value={profile.email}
                                        readOnly
                                        title="Email changes are not supported yet"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/30 border border-border text-muted-foreground cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Read-only for now - the API does not allow changing your sign-in email yet.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Default Currency
                                    </label>
                                        <select
                                            value={profile.currency}
                                            onChange={(e) => setProfile({ ...profile, currency: e.target.value as CurrencyCode })}
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
                                        value={profile.timezone}
                                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    >
                                        <option value="Africa/Lagos">Lagos (WAT)</option>
                                        <option value="Africa/Nairobi">Nairobi (EAT)</option>
                                        <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                                        <option value="Africa/Casablanca">Casablanca (WEST)</option>
                                    </select>
                                </div>

                                {profileError && (
                                    <p
                                        role="alert"
                                        className="text-xs text-red-400 rounded-lg px-3 py-2"
                                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)" }}
                                    >
                                        {profileError}
                                    </p>
                                )}

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
                                    <Button className="gap-2 bg-brand hover:bg-brand/90" disabled>
                                        Connect Raenest Account - coming soon
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Payment links are generated from each invoice&apos;s page instead.
                                        Direct Raenest account connection is not wired up yet.
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
                                {prefsError && (
                                    <p
                                        role="alert"
                                        className="text-xs text-red-400 rounded-lg px-3 py-2"
                                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)" }}
                                    >
                                        {prefsError}
                                    </p>
                                )}
                                {NOTIFICATION_ITEMS.map((item) => (
                                    <div key={item.key} className="flex items-start justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={prefs[item.key]}
                                                onChange={() => togglePref(item.key)}
                                                aria-label={item.label}
                                            />
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
                                        autoComplete="current-password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
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
                                        autoComplete="new-password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        At least 8 characters, one uppercase letter and one number.
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                    />
                                </div>
                                {passwordError && (
                                    <p
                                        role="alert"
                                        className="text-xs text-red-400 rounded-lg px-3 py-2"
                                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)" }}
                                    >
                                        {passwordError}
                                    </p>
                                )}
                                <Button onClick={handleUpdatePassword} disabled={saving} className="gap-2">
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
                                        Deactivating your account signs you out everywhere and stops all access.
                                        Your invoices, clients and projects are retained for your records.
                                    </p>
                                    {!showDelete ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setShowDelete(true)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Account
                                        </Button>
                                    ) : (
                                        <div
                                            className="space-y-3 rounded-xl p-4"
                                            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.30)" }}
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Confirm your password
                                                </label>
                                                <input
                                                    type="password"
                                                    autoComplete="current-password"
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Type DELETE to confirm
                                                </label>
                                                <input
                                                    type="text"
                                                    value={deleteConfirm}
                                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                                    placeholder="DELETE"
                                                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border focus:border-brand focus:outline-none"
                                                />
                                            </div>
                                            {deleteError && (
                                                <p
                                                    role="alert"
                                                    className="text-xs text-red-400 rounded-lg px-3 py-2"
                                                    style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)" }}
                                                >
                                                    {deleteError}
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="gap-2"
                                                    disabled={deleting}
                                                    onClick={handleDeleteAccount}
                                                >
                                                    {deleting ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                                                    ) : (
                                                        <><Trash2 className="w-4 h-4" /> Permanently deactivate</>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={deleting}
                                                    onClick={() => {
                                                        setShowDelete(false);
                                                        setDeletePassword("");
                                                        setDeleteConfirm("");
                                                        setDeleteError(null);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}