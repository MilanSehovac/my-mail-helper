import {Building2, ChevronRight, FileText, Mail, Settings, Users} from "lucide-react";
import {NavLink} from "react-router-dom";
import SidebarUser from "./SidebarUser";

const navItems = [
    { to: "/agencies", icon: Building2, label: "Agencies" },
    { to: "/campaigns", icon: Mail, label: "Campaigns" },
    { to: "/templates", icon: FileText, label: "Email Templates" },
    { to: "/contacts", icon: Users, label: "Contacts" },
    { to: "/settings", icon: Settings, label: "Settings" },
];
export default function Sidebar(){
    return(
        <aside className="fixed inset-y-0 left-0 w-60 flex flex-col bg-[#0a1628] border-r border-slate-800/60 z-30">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800/60">
                <div className="flex items-center justify-center size-8 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
                    <Mail className="size-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-100 tracking-tight">My Mail Helper</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={label}
                        to={to}
                        className={({ isActive}) =>
                            `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                                isActive
                                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`size-4 shrink-0 ${isActive ? "text-sky-400" : "text-slate-600 group-hover:text-slate-400"}`} />
                                {label}
                                {isActive && <ChevronRight className="size-3 ml-auto text-sky-400/60" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-slate-800/60">
                <SidebarUser />
            </div>
        </aside>
    )
}