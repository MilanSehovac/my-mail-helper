import Sidebar from './Sidebar';
import Header from './Header';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020817]">
            <Sidebar />
            <Header />
            <main className="pl-60 pt-14 min-h-screen">
                <div className="px-8 py-8 max-w-[1400px]">
                    {children}
                </div>
            </main>
        </div>
    );
}