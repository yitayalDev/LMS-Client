'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { BookOpen, User as UserIcon, LogOut, MessageSquare, Flame, Trophy } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

import { useRouter } from 'next/navigation';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        {settings?.platformLogo ? (
                            <img
                                src={getMediaUrl(settings.platformLogo)}
                                alt="Logo"
                                className="h-8 w-8 object-contain"
                            />
                        ) : (
                            <BookOpen className="h-8 w-8 text-primary" />
                        )}
                        <span className="text-xl font-bold">{settings?.platformName || 'LMSUOG'}</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link href="/courses" className="text-sm font-medium hover:text-primary">
                            Browse Courses
                        </Link>

                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/messages" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Messages
                                </Link>
                                <Link href="/leaderboard" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                                    <Trophy className="h-4 w-4" />
                                    Leaderboard
                                </Link>
                                <NotificationBell />
                                <div className="flex items-center space-x-2 bg-gray-100 p-1 pl-3 rounded-full">
                                    {user.loginStreak && user.loginStreak > 0 && (
                                        <div className="flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full text-xs font-bold mr-1">
                                            <Flame className="h-3 w-3" />
                                            {user.loginStreak}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium">{user.name}</span>
                                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
