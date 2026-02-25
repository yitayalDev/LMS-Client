'use client';

import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { getMediaUrl } from '@/lib/utils';

export function TopBar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const avatarUrl = getMediaUrl(user?.avatar);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="flex items-center justify-end p-4 glass border-b border-white/10 mb-6 rounded-xl mx-4 mt-4">
            <div className="flex items-center gap-x-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-white">{user?.name}</span>
                    <span className="text-xs text-zinc-400 capitalize">{user?.role}</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-white/10 text-white">
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/10" onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
