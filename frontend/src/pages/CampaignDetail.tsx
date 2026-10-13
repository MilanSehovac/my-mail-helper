import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import API from "../api/axios";

interface Recipient {
    id: number;
    status: string;
    sent_at: string | null;
    attempts: number;
    last_error: string | null;
    next_attempt_at: string | null;
    contact: { id: number; full_name: string | null; email: string };
}

interface Detail {
    campaign: { id: number; name: string; description?: string | null; target: string; status: string; sent: number; total: number; daily_limit: number; scheduled_at: string | null; send_mode: string };
    template: { id: number; name: string; subject: string } | null;
    status_counts: Record<string, number>;
    recipients: Recipient[];
    recipients_total: number;
}

const PAGE = 50;
const badge: Record<string, string> = {
    Sent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Pending: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    Sending: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    Failed: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    Skipped: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function CampaignDetail() {
    const { id } = useParams();
    const [detail, setDetail] = useState<Detail | null>(null);
    const [filter, setFilter] = useState("");
    const [offset, setOffset] = useState(0);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const load = useCallback(async () => {
        try {
            const res = await API.get(`/campaign/${id}`, { params: { limit: PAGE, offset, status: filter || undefined } });
            setDetail(res.data);
            setError("");
        } catch (err: any) {
            setError(err.response?.data?.error || "Could not load campaign");
        }
    }, [id, offset, filter]);

    useEffect(() => {
        load();
        const timer = setInterval(load, 15000);
        return () => clearInterval(timer);
    }, [load]);

    const retry = async () => {
        try {
            const res = await API.post(`/campaign/${id}/retry-failed`);
            setMessage(res.data.message);
            load();
        } catch (err: any) {
            setMessage(err.response?.data?.error || "Retry failed");
        }
    };

    if (error) return <p className="text-sm text-rose-400">{error}</p>;
    if (!detail) return <p className="text-sm text-slate-500">Loading…</p>;

    const { campaign, template, status_counts, recipients, recipients_total } = detail;
    const failed = status_counts.Failed ?? 0;

    return (
        <>
            <Link to="/campaigns" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors">
                <ArrowLeft className="size-4" /> Back to Campaigns
            </Link>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">{campaign.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {campaign.status} · segment "{campaign.target}" · template {template ? `"${template.name}"` : "(deleted)"} · {campaign.daily_limit}/day
                        {campaign.scheduled_at && ` · scheduled ${new Date(campaign.scheduled_at).toLocaleString()}`}
                    </p>
                </div>
                {failed > 0 && (
                    <button onClick={retry} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg">
                        <RotateCcw className="size-4" /> Retry {failed} failed
                    </button>
                )}
            </div>
            {message && <p className="text-xs text-slate-400 mb-4">{message}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
                {["", ...Object.keys(badge)].map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => { setFilter(s); setOffset(0); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === s ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
                    >
                        {s || "All"} {s ? `(${status_counts[s] ?? 0})` : `(${campaign.total})`}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800/60">
                            {["Recipient", "Status", "Sent", "Attempts", "Details"].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {recipients.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-600">No recipients yet. They are fixed when the campaign is launched.</td></tr>
                        ) : recipients.map((r) => (
                            <tr key={r.id}>
                                <td className="px-6 py-3">
                                    <p className="text-sm text-slate-200">{r.contact.full_name}</p>
                                    <p className="text-xs font-mono text-sky-400">{r.contact.email}</p>
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badge[r.status] ?? badge.Pending}`}>{r.status}</span>
                                </td>
                                <td className="px-6 py-3 text-xs text-slate-500 font-mono">{r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}</td>
                                <td className="px-6 py-3 text-xs text-slate-500 font-mono">{r.attempts}</td>
                                <td className="px-6 py-3 text-xs text-slate-500 max-w-xs truncate" title={r.last_error ?? ""}>
                                    {r.last_error ?? (r.next_attempt_at ? `retry at ${new Date(r.next_attempt_at).toLocaleTimeString()}` : "")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>{recipients_total === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE, recipients_total)} of {recipients_total}</span>
                    <span className="flex gap-3">
                        <button disabled={offset === 0} onClick={() => setOffset(Math.max(offset - PAGE, 0))} className="disabled:opacity-30 hover:text-slate-300">Prev</button>
                        <button disabled={offset + PAGE >= recipients_total} onClick={() => setOffset(offset + PAGE)} className="disabled:opacity-30 hover:text-slate-300">Next</button>
                    </span>
                </div>
            </div>
        </>
    );
}
