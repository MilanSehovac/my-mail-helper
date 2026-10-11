import { useState } from 'react';
import {Search, Trash} from "lucide-react";
import type {Contact} from '../types/Contact'
interface ContactsTableProps{
    data: Contact[],
    onDelete?: (id: number) => void;
}
const statusMap: Record<Contact["status"], string> = {
    Subscribed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Unsubscribed: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    Bounced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};
function Avatar({ full_name }: { full_name: string }) {
    const initials = full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const colors = [
        "from-sky-400 to-blue-600",
        "from-violet-400 to-purple-600",
        "from-emerald-400 to-teal-600",
        "from-amber-400 to-orange-600",
        "from-rose-400 to-pink-600",
    ];
    const color = colors[full_name.charCodeAt(0) % colors.length];
    return (
        <div className={`size-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
            {initials}
        </div>
    );
}
export default function ContactsTable({ data, onDelete } : ContactsTableProps){
    const [search, setSearch] = useState('');
    const [activeTag, setActiveTag] = useState('All')

    const tags = ["All", ...Array.from(new Set(data.map((contact) => contact.tag)))]

    const filtered = data.filter((contact) => {
        const matchSearch =
            (contact.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            contact.email.toLowerCase().includes(search.toLowerCase());
        const matchTag = activeTag === "All" || contact.tag === activeTag;
        return matchSearch && matchTag;
    });
    return(
        <>
            {/* Filters + search */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                activeTag === tag
                                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search contacts…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 w-52 bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-800/60">
                            {["Contact", "Email", "Company / Role", "Tag", "Added", "Status", ""].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-600">No contacts found.</td>
                            </tr>
                        ) : (
                            filtered.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar full_name={c.full_name ?? c.email} />
                                            <span className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">{c.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono text-sky-400">{c.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-600">{c.position}</p>
                                        <p className="text-slate-500">{c.agency?.name || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">{c.tag}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-500 font-mono">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusMap[c.status]}`}>
                        <span className="size-1.5 rounded-full bg-current" />
                          {c.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            title="Delete"
                                            onClick={() => onDelete?.(c.id)}
                                            className="flex items-center justify-center size-7 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
                                        >
                                            <Trash className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-slate-800/60">
                    <p className="text-xs text-slate-600 font-mono">Showing {filtered.length} of {data.length} contacts</p>
                </div>
            </div>
        </>
    )
}