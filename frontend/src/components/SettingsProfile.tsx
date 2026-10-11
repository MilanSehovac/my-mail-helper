import {useEffect, useState} from 'react';
import Avatar from './Avatar';

export interface ProfileData {
    first_name: string;
    last_name: string;
    email: string;
    company: string;
}

interface SettingsProfileProps {
    data: ProfileData;
    onChange?: (data: ProfileData) => void;
    onSave?: (data: ProfileData) => Promise<void> | void;
    savedToast?: React.ReactNode;
}

export default function SettingsProfile({ data, onSave, onChange, savedToast }: SettingsProfileProps) {
    const [formData, setFormData] = useState<ProfileData>({
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        company: data.company ?? "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const formFields: Array<{ label: string; key: keyof ProfileData; value: string }> = [
        { label: "First Name", key: "first_name", value: formData.first_name ?? "" },
        { label: "Last Name", key: "last_name", value: formData.last_name ?? "" },
        { label: "Email Address", key: "email", value: formData.email ?? "" },
        { label: "Company", key: "company", value: formData.company ?? "" },
    ];

    const handleChange = (key: keyof ProfileData, value: string) => {
        const updated = { ...formData, [key]: value };
        setFormData(updated);
        onChange?.(updated);
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await onSave?.(formData);
        } catch (error: any) {
            setError('Greška pri čuvanju profila. Pokušaj ponovo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-6">
            <h2 className="text-base font-semibold text-slate-100">Profile Information</h2>

            <div className="flex items-center gap-5 pb-6 border-b border-slate-800/60">
                <Avatar
                    firstName={formData.first_name}
                    lastName={formData.last_name}
                    className="size-16"
                />
                <div>
                    <p className="text-sm font-medium text-slate-200">
                        {formData.first_name} {formData.last_name}
                    </p>
                    <p className="text-xs text-slate-500 mb-2">{formData.email}</p>
                    <button className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                        Change avatar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {formFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                    {loading ? 'Čuvam...' : 'Save Changes'}
                </button>
                {savedToast}
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800/60 rounded-lg">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}