'use client';

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DemoBanner = () => {
    const { user } = useAuth();

    if (!user || !user.isDemo) return null;

    return (
        <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md py-2 px-4 sticky top-0 z-[100] animate-in slide-in-from-top duration-500">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Demo Mode Active</p>
                </div>
                <div className="flex-1 text-center">
                    <p className="text-sm font-medium text-zinc-300">
                        Some actions are limited for security. <span className="text-amber-500/80 hidden sm:inline">Data may reset periodically.</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Read Only</span>
                </div>
            </div>
        </div>
    );
};

export default DemoBanner;
