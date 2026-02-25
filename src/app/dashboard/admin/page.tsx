'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, BookOpen, Settings, LayoutDashboard, DollarSign, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminAnalytics } from '@/components/dashboard/AdminAnalytics';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">System Administration</h1>
                <div className="flex space-x-4">
                    <Link href="/dashboard/admin/settings">
                        <Button variant="outline">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                    <Link href="/dashboard/admin/finance">
                        <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Financials
                        </Button>
                    </Link>
                </div>
            </div>

            <AdminAnalytics />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:bg-gray-50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500">Quick Links</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/dashboard/admin/users" className="text-sm font-medium text-blue-600 hover:underline block">
                            User Directory
                        </Link>
                        <Link href="/dashboard/admin/organizations" className="text-sm font-medium text-blue-600 hover:underline block">
                            Organizations
                        </Link>
                        <Link href="/dashboard/admin/courses" className="text-sm font-medium text-blue-600 hover:underline block">
                            Course Queue
                        </Link>
                        <Link href="/dashboard/admin/compliance" className="text-sm font-medium text-blue-600 hover:underline block">
                            Compliance Reports
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Administrative Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground py-8 text-center italic">
                            No critical alerts at this time.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
