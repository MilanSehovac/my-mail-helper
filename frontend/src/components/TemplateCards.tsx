import {useState} from 'react'
import {FileText, Search, Trash2} from "lucide-react";
interface TemplateCardProps{
        data: any[],
        onDelete: (id: number) => void,
}

export default function TemplateCards({data, onDelete}: TemplateCardProps){
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const categories = ['All', ...Array.from(new Set(data.map((template)=> template.category)))]
    const filtered = data.filter((t) => {
        const matchSearch =
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.subject.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === "All" || t.category === activeCategory;
        return matchSearch && matchCat;
    });
    const categoryColor = (category?: string | null) => {
        switch (category) {
            case 'Follow-up':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Demo':
                return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
            case 'Onboarding':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Outreach':
                return 'text-sky-400 bg-sky-400/10 border-sky-400/20'
            default:
                return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
        }
    };
    return(
        <>
            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                activeCategory === cat
                                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search templates…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 w-52 bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                    />
                </div>
            </div>
            {/* Template cards */}
            <div className="grid grid-cols-1 gap-3">
                {filtered.map((template) => (
                    <div
                        key={template.id}
                        className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-colors group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                                <div className="flex items-center justify-center size-10 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 mt-0.5">
                                    <FileText className="size-4 text-sky-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                                            {template.name}
                                        </p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColor(template.category)}`}>
                                          {template.category}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono text-slate-500 mb-2 truncate">Subject: {template.subject}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">{template.preview}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => onDelete(template.id)} title="Delete" className="flex items-center justify-center size-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800/60">
                            <span className="text-xs text-slate-600">Last edited <span className="text-slate-500">{template.updated_at ? new Date(template.updated_at).toLocaleDateString() : '—'}</span></span>
                            <span className="text-xs text-slate-600">Used in <span className="text-slate-500 font-mono">{template.used_in ?? 0}</span> campaigns</span>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl py-16 text-center">
                        <FileText className="size-8 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm text-slate-600">No templates match your filters.</p>
                    </div>
                )}
            </div>
        </>

    )
}