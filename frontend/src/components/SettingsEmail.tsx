import { useState } from "react";
import type { ChangeEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import type { SmtpConfig } from "../types/Smtp";

interface SettingsEmailProps {
    data: SmtpConfig;
    onChange: (data: SmtpConfig) => void;
    onSave: (data: SmtpConfig) => Promise<void> | void;
    onTestEmail?: (data: SmtpConfig) => Promise<void> | void;
}

const inputClass =
    "w-full px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all";

export default function SettingsEmail({ data, onChange, onSave, onTestEmail }: SettingsEmailProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        onChange({
            ...data,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await onSave(data);
        } catch {
            setError("Failed to save SMTP settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        if (!onTestEmail) return;
        setTesting(true);
        setTestResult(null);
        setError(null);
        try {
            await onTestEmail(data);
            setTestResult("Test email sent to your account address.");
        } catch (err: any) {
            setError(err?.response?.data?.error || "Test email failed.");
        } finally {
            setTesting(false);
        }
    };

    const fields: Array<{ label: string; name: keyof SmtpConfig; type: string; placeholder: string }> = [
        { label: "From Name", name: "from_name", type: "text", placeholder: "My App" },
        { label: "From Email", name: "from_email", type: "email", placeholder: "hello@yourdomain.com" },
        { label: "SMTP Host", name: "smtp_host", type: "text", placeholder: "smtp.gmail.com" },
        { label: "SMTP Port", name: "smtp_port", type: "number", placeholder: "587" },
        { label: "SMTP Username", name: "smtp_user", type: "text", placeholder: "user@gmail.com" },
        { label: "SMTP Password / App Password", name: "smtp_password", type: "password", placeholder: "Leave blank to keep the saved password" },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-6 max-w-2xl">
            <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-100">Email & SMTP Configuration</h2>
                <p className="text-xs text-slate-400">
                    Configure the SMTP account used to send campaigns (Gmail App Password, Mailgun, Brevo, etc.).
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                    <div key={f.name}>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                        <input
                            type={f.type}
                            name={f.name}
                            value={(data[f.name] as string | number | undefined) ?? ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            autoComplete={f.type === "password" ? "new-password" : "off"}
                            className={inputClass}
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing || !onTestEmail}
                    className="text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                    {testing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                    Send test email
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
                >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Save
                </button>
            </div>
            {testResult && <p className="text-xs text-emerald-400">{testResult}</p>}
            {error && (
                <div className="p-3 bg-red-900/30 border border-red-800/60 rounded-lg">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
