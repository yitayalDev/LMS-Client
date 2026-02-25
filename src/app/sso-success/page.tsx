'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function SSOSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            router.push('/dashboard');
        } else if (typeof window !== 'undefined' && !token) {
            router.push('/login');
        }
    }, [token, router]);

    return (
        <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-white">Completing Login...</h2>
            <p className="text-zinc-400">Please wait while we set up your session.</p>
        </div>
    );
}

export default function SSOSuccess() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950/40">
            <Suspense fallback={<div className="text-white">Loading session...</div>}>
                <SSOSuccessContent />
            </Suspense>
        </div>
    );
}
