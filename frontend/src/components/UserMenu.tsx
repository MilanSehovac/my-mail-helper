import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserMenu() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [userName] = useState('JD');

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

    const handleSettings = () => {
        navigate('/settings');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
                <div className="size-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {userName}
                </div>
                <ChevronDown className={`size-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/60 rounded-lg shadow-lg z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-700/40">
                        <p className="text-xs font-semibold text-slate-300">Milan Sehovac</p>
                        <p className="text-xs text-slate-500">milansehovacx5@gmail.com</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                navigate('/profile');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
                        >
                            <User className="size-4 text-slate-500" />
                            My Profile
                        </button>

                        <button
                            onClick={handleSettings}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
                        >
                            <Settings className="size-4 text-slate-500" />
                            Settings
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-700/40 py-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                            <LogOut className="size-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}