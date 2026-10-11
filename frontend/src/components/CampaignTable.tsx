import {useState} from "react";
import {Link} from "react-router-dom";
import {LayoutDashboard, Mail, Pause, Search, Trash2} from "lucide-react";
interface CampaignTableProps {
    data: any[];
    onDelete?: (id: any) => void;
    onPause?: (id: any) => void;
}

export default function CampaignTable({data, onDelete, onPause}: CampaignTableProps){
    const [search, setSearch] = useState('')

    const ProgressBar = ({ sent, total }: { sent: number; total: number }) => {
        const pct = total > 0 ? Math.min(100, Math.round((sent / total) * 100)) : 0;
        return (
            <div className="flex items-center gap-3 min-w-[140px]">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="font-mono text-xs text-slate-400 whitespace-nowrap">{sent}/{total}</span>
            </div>
        );
    }

    const StatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sending':
                return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
            case 'scheduled':
                return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
            case 'completed':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'paused':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
        }
    }

    const filtered = data.filter(
        (campaign) =>
            campaign.name.toLowerCase().includes(search.toLowerCase()) ||
            campaign.target.toLowerCase().includes(search.toLowerCase())
    );

    return(
    <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
                <LayoutDashboard className="size-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-200">All Campaigns</span>
                <span className="ml-1 text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Filter campaigns…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 w-52 bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-slate-800/60">
                    {["Campaign Name", "Target Group", "Progress", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                {filtered.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-600">
                            No campaigns match your search.
                        </td>
                    </tr>
                ) : (
                    filtered.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center size-8 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0">
                                        <Mail className="size-3.5 text-sky-400" />
                                    </div>
                                    <div>
                                        <Link to={`/campaigns/${campaign.id}`} className="text-sm font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
                                            {campaign.name}
                                        </Link>
                                        <p className="text-xs text-slate-600 font-mono mt-0.5">#{String(campaign.id).padStart(4, "0")}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-400">{campaign.target}</span>
                            </td>
                            <td className="px-6 py-4">
                                <ProgressBar sent={campaign.sent} total={campaign.total} />
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${StatusBadge(campaign.status)}`}>
                                    <span className="size-1.5 rounded-full bg-current" />
                                    {campaign.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        title={campaign.status === "Paused" ? "Resume" : "Pause"}
                                        onClick={() => onPause?.(campaign.id)}
                                        disabled={campaign.status === "Completed"}
                                        className="flex items-center justify-center size-8 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Pause className="size-3.5" />
                                    </button>
                                    <button
                                        title="Delete"
                                        onClick={() => onDelete?.(campaign.id)}
                                        className="flex items-center justify-center size-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/60">
            <p className="text-xs text-slate-600 font-mono">Showing {filtered.length} of {data.length} campaigns</p>
            <div className="flex items-center gap-1">
                {[1, 2, 3].map((n) => (
                    <button
                        key={n}
                        className={`size-7 text-xs rounded-md transition-colors font-mono ${
                            n === 1
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : "text-slate-600 hover:text-slate-400 hover:bg-slate-800"
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    </div>
    )
}