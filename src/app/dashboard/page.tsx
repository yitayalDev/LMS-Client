'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role === 'admin') {
                router.push('/dashboard/admin');
            } else if (user.role === 'instructor') {
                router.push('/dashboard/instructor');
            } else if (user.role === 'organization') {
                router.push('/dashboard/organization/teams');
            } else if (user.role === 'manager') {
                router.push('/dashboard/manager');
            } else {
                router.push('/dashboard/student');
            }
        }
    }, [user, loading, router]);

    return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
}
