import { useState, useEffect } from 'react';
import { Bell, Check, CreditCard, Mail, Shield, User } from "lucide-react";
import Hero from "../components/Hero";
import SettingsProfile from "../components/SettingsProfile"
import type {ProfileData} from "../components/SettingsProfile"
import SettingsEmail from "../components/SettingsEmail"
import SettingsNotifications from "../components/SettingsNotifications"
import SettingsSecurity from "../components/SettingsSecurity"
import SettingsBilling from "../components/SettingsBilling"
import API from "../api/axios";
import type {SmtpConfig} from "../types/Smtp";

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "email", label: "Email & SMTP", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
];

function SavedToast() {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="size-3.5" /> Saved
        </span>
    );
}

export default function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profile, setProfile] = useState<ProfileData>({
        email: '',
        first_name: '',
        last_name: '',
        company: ''
    });

    const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_password: '',
        from_name: '',
        from_email: '',
        is_configured: false
    });

    const [notifications, setNotifications] = useState({
        campaign_complete: true,
        new_reply: true,
        weekly_digest: false,
        bounce_alert: true,
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);

                const [profileRes, smtpRes, notifRes] = await Promise.all([
                    API.get('/settings/profile'),
                    API.get('/settings/smtp'),
                    API.get('/settings/notifications'),
                ]);

                setProfile({
                    email: profileRes.data.email ?? '',
                    first_name: profileRes.data.first_name ?? '',
                    last_name: profileRes.data.last_name ?? '',
                    company: profileRes.data.company ?? '',
                });
                setSmtpConfig({ ...smtpRes.data, smtp_password: '' });
                setNotifications(notifRes.data);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSaveProfile = async (profileData: ProfileData) => {
        try {
            await API.put('/settings/profile', profileData);
            showSaveToast();
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    const handleSaveSmtp = async (smtpSettings: SmtpConfig) => {
        await API.put('/settings/smtp', smtpSettings);
        setSmtpConfig({ ...smtpSettings, smtp_password: '', is_configured: true });
        showSaveToast();
    };

    const handleTestSmtp = async (smtpSettings: SmtpConfig) => {
        await API.post('/service/email/test', smtpSettings);
    };

    const handleChangePassword = async (current_password: string, new_password: string) => {
        await API.put('/settings/security/password', { current_password, new_password });
        showSaveToast();
    };

    const handleSaveNotifications = async () => {
        try {
            await API.put('/settings/notifications', notifications);
            showSaveToast();
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    };

    const showSaveToast = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-slate-400">Loading settings...</div>;
    }

    return (
        <>
            <Hero
                title={'Settings'}
                paragraph={'Manage your account preferences and integrations.'}
            />
            <div className="flex gap-6">
                {/* Tab sidebar */}
                <nav className="w-48 shrink-0">
                    <ul className="space-y-0.5">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <li key={id}>
                                <button
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === id
                                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                                    }`}
                                >
                                    <Icon className={`size-4 ${activeTab === id ? "text-sky-400" : "text-slate-600"}`} />
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Panel */}
                <div className="flex-1 min-w-0">
                    {/* Save toast */}
                    {saved && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <SavedToast />
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <SettingsProfile
                            data={profile}
                            onChange={setProfile}
                            onSave={handleSaveProfile}
                        />
                    )}
                    {activeTab === 'email' && (
                        <SettingsEmail
                            data={smtpConfig}
                            onChange={setSmtpConfig}
                            onSave={handleSaveSmtp}
                            onTestEmail={handleTestSmtp}
                        />
                    )}
                    {activeTab === 'notifications' && (
                        <SettingsNotifications
                            data={notifications}
                            onChange={setNotifications}
                            onSave={handleSaveNotifications}
                        />
                    )}
                    {activeTab === 'security' && (
                        <SettingsSecurity onChangePassword={handleChangePassword} />
                    )}
                    {activeTab === 'billing' && <SettingsBilling />}
                </div>
            </div>
        </>
    );
}