import {Bell, Search} from "lucide-react";
import UserMenu from './UserMenu'
export default function Header() {
    return (
        <header className="fixed top-0 left-60 right-0 h-14 flex items-center justify-between px-6 bg-[#020817]/80 border-b border-slate-800/60 z-20 backdrop-blur-sm">
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search campaigns, contacts…"
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                />
            </div>
            <div className="flex items-center gap-3">
                <button className="relative flex items-center justify-center size-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors">
                    <Bell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-sky-400" />
                </button>

                <UserMenu />
            </div>
        </header>
    );
}