'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900/50 backdrop-blur-xl border-r border-white/10">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <TopBar />
                <div className="px-4 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
