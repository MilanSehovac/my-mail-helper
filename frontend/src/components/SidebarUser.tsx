import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SidebarUser() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* User button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors group"
            >
                <div className="size-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    JD
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-medium text-slate-200 truncate">Milan Sehovac</p>
                    <p className="text-xs text-slate-500 truncate">milansehovacx5@gmail.com</p>
                </div>
                <ChevronUp
                    className={`size-3 text-slate-600 transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-700/60 rounded-lg shadow-lg z-50">
                    <button
                        onClick={() => {
                            navigate('/settings');
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors border-b border-slate-700/40"
                    >
                        <Settings className="size-4 text-slate-500" />
                        Settings
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                        <LogOut className="size-4" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}