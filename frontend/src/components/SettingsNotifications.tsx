export interface NotificationData {
    campaign_complete: boolean;
    new_reply: boolean;
    weekly_digest: boolean;
    bounce_alert: boolean;
}

interface SettingsNotificationsProps {
    data: NotificationData;
    onChange: (data: NotificationData) => void;
    onSave: () => Promise<void> | void;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-sky-500" : "bg-slate-700"}`}
        >
            <span className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
        </button>
    );
}

export default function SettingsNotifications({ data, onChange, onSave }: SettingsNotificationsProps) {
    const formFields = [
        { key: "campaign_complete" as const, label: "Campaign completed", desc: "Get notified when a campaign finishes sending." },
        { key: "new_reply" as const, label: "New reply received", desc: "Alert when a contact replies to a campaign email." },
        { key: "weekly_digest" as const, label: "Weekly digest", desc: "A summary of campaign performance every Monday." },
        { key: "bounce_alert" as const, label: "Bounce alert", desc: "Notify when bounce rate exceeds 2%." },
    ];
    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-1">
            <h2 className="text-base font-semibold text-slate-100 mb-5">Notification Preferences</h2>
            {formFields.map((item, i, arr) => (
                <div key={item.key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? "border-b border-slate-800/60" : ""}`}>
                    <div>
                        <p className="text-sm font-medium text-slate-200">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                        enabled={data[item.key]}
                        onChange={(v) => onChange({ ...data, [item.key]: v })}
                    />
                </div>
            ))}
            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={() => onSave()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
