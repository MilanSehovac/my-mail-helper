import {useState} from "react";
import {Building2, Globe, MapPin, Pencil, Search, Trash} from "lucide-react";
import {Link} from "react-router-dom";

interface TableProps {
    data: any[];
    onDelete?: (id: any) => void;
    link?: string;
}

export default function AgencyTable({ data, onDelete, link }: TableProps) {
    const [search, setSearch] = useState('')

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sending':
                return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'paused':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
        }
    };
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl py-16 text-center">
                <Building2 className="size-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600">No Agencies to display.</p>
            </div>
        );
    }
    const filtered = data.filter((agency) => {
        const query = search.toLowerCase();

        const nameMatch = agency.name?.toLowerCase().includes(query);
        const countryMatch = agency.country?.toLowerCase().includes(query);

        return nameMatch || countryMatch;
    });
    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-200">All Agencies</span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full ml-1">{filtered.length}</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search agencies…"
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
                        {["Agency", "Location", "Website", "Contacts", "Campaigns", "Last Contact", "Status", "Edit", "Delete"].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                    {filtered.map((agency) => (
                        <tr key={agency.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                                        <Building2 className="size-3.5 text-sky-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">{agency.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                    <MapPin className="size-3 text-slate-600" />
                                    {agency.city}, {agency.country}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Link to={agency.website} target={'_blank'} className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
                                    <Globe className="size-3" />
                                    {agency.website}
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-mono text-slate-400">{agency.contacts_count || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-mono text-slate-400">0</span>
                            </td>
                            <td className={"px-6 py-4"}>
                                <span className="text-sm font-mono font-medium text-slate-400"> {agency.last_contact? agency.last_contact : 'never'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(agency.status)}`}>
                                  <span className="size-1.5 rounded-full bg-current" />
                                    {agency.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <Link to={`${link ?? '/agency/'}${agency.id}`} className="flex items-center justify-center size-7 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all">
                                    <Pencil className="size-4" />
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <button onClick={() => onDelete?.(agency.id)} className="cursor-pointer flex items-center justify-center size-7 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all">
                                    <Trash className="size-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}