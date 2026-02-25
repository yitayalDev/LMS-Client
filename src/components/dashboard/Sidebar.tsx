'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Settings,
    LogOut,
    MessageSquare,
    Users,
    Video,
    CreditCard,
    Activity,
    Building2,
    BarChart3,
    Tag
} from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const routes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: `/dashboard/${user?.role}`,
            color: "text-sky-500",
        },
        // Role specific routes
        ...(user?.role === 'student' ? [
            {
                label: 'My Courses',
                icon: BookOpen,
                href: '/dashboard/student/courses',
                color: "text-violet-500",
            },
            {
                label: 'My Certificates',
                icon: GraduationCap,
                href: '/dashboard/student/certificates',
                color: "text-pink-700",
            },
        ] : []),
        ...(user?.role === 'instructor' ? [
            {
                label: 'Manage Courses',
                icon: BookOpen,
                href: '/dashboard/instructor/courses',
                color: "text-violet-500",
            },
            {
                label: 'Live Sessions',
                icon: Video,
                href: '/dashboard/instructor/live-sessions',
                color: "text-orange-700",
            },
            {
                label: 'Earnings',
                icon: CreditCard,
                href: '/dashboard/instructor/earnings',
                color: "text-emerald-500",
            },
        ] : []),
        ...(user?.role === 'admin' ? [
            {
                label: 'Users',
                icon: Users,
                href: '/dashboard/admin/users',
                color: "text-orange-700",
            },
            {
                label: 'Finance',
                icon: CreditCard,
                href: '/dashboard/admin/finance',
                color: "text-emerald-500",
            },
            {
                label: 'Coupons',
                icon: Tag,
                href: '/dashboard/admin/coupons',
                color: "text-purple-500",
            },
            {
                label: 'Audit Logs',
                icon: Activity,
                href: '/dashboard/admin/audit-logs',
                color: "text-blue-500",
            },
        ] : []),
        ...(user?.role === 'organization' ? [
            {
                label: 'Team Management',
                icon: Building2,
                href: '/dashboard/organization/teams',
                color: "text-sky-500",
            }
        ] : []),
        ...(user?.role === 'manager' ? [
            {
                label: 'My Team',
                icon: BarChart3,
                href: '/dashboard/manager',
                color: "text-indigo-500",
            }
        ] : []),

        {
            label: 'Messages',
            icon: MessageSquare,
            href: `/dashboard/messages`,
            color: "text-pink-700",
        },
        {
            label: 'Settings',
            icon: Settings,
            href: `/dashboard/${user?.role}/settings`,
        },
    ];

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75"></div>
                        <div className="relative bg-black rounded-lg w-full h-full flex items-center justify-center border border-white/10">
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">L</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                        LMS Gen
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div
                    onClick={handleLogout}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-red-500 hover:bg-red-500/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Logout
                    </div>
                </div>
            </div>
        </div>
    );
}
