import { useState } from "react";

interface SettingsSecurityProps {
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export default function SettingsSecurity({ onChangePassword }: SettingsSecurityProps) {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const formFields = [
        { label: "Current Password", placeholder: "••••••••", value: current, set: setCurrent },
        { label: "New Password", placeholder: "Min. 12 characters", value: next, set: setNext },
        { label: "Confirm New Password", placeholder: "Repeat new password", value: confirm, set: setConfirm },
    ];

    const handleSubmit = async () => {
        setError(null);
        if (next.length < 12) return setError("New password must be at least 12 characters.");
        if (next !== confirm) return setError("Passwords do not match.");
        setLoading(true);
        try {
            await onChangePassword(current, next);
            setCurrent("");
            setNext("");
            setConfirm("");
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-6">
            <h2 className="text-base font-semibold text-slate-100">Security</h2>
            <div className="space-y-4">
                {formFields.map((f) => (
                    <div key={f.label}>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                        <input
                            type="password"
                            value={f.value}
                            onChange={(e) => f.set(e.target.value)}
                            placeholder={f.placeholder}
                            autoComplete="new-password"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                        />
                    </div>
                ))}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 rounded-lg transition-colors"
                >
                    Update Password
                </button>
            </div>
        </div>
    );
}
