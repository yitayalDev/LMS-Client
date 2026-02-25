'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// API_URL moved to @/lib/api

export default function AdminFinancePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, payoutsRes] = await Promise.all([
                api.get(`/payouts/platform-stats`),
                api.get(`/payouts/all`)
            ]);
            setStats(statsRes.data);
            setPayouts(payoutsRes.data);
        } catch (error) {
            console.error('Failed to fetch platform finance data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePayout = async (id: string, status: string) => {
        const adminNotes = prompt('Add any notes for the instructor (optional):');
        try {
            await api.patch(`/payouts/${id}/status`, { status, adminNotes });
            alert(`Payout ${status} successfully.`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update payout');
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    if (loading) return <div className="p-8 text-center">Loading platform financials...</div>;

    const overview = stats?.overview || { totalSales: 0, totalRevenue: 0, totalInstructorEarnings: 0, count: 0 };
    const pending = stats?.pendingPayouts || { total: 0, count: 0 };

    const chartData = [
        { name: 'Instructor Earnings (80%)', value: overview.totalInstructorEarnings, color: '#3b82f6' },
        { name: 'Platform Revenue (20%)', value: overview.totalRevenue, color: '#10b981' }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Platform Financials</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Gross Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${overview.totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Platform Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">${overview.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-green-600 mt-1">20% commission on all sales</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Instructor Payouts (Est.)</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${overview.totalInstructorEarnings.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Pending Withdrawals</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">${pending.total.toFixed(2)}</div>
                        <p className="text-xs text-amber-600 mt-1">{pending.count} requests awaiting approval</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Split</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl">Instructor Payout Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payouts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                No payout requests found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Instructor</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Method</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-[13px]">
                                        {payouts.map((p) => (
                                            <tr key={p._id}>
                                                <td className="px-4 py-4">
                                                    <div className="font-bold">{p.instructor.name}</div>
                                                    <div className="text-xs text-muted-foreground">{p.instructor.email}</div>
                                                </td>
                                                <td className="px-4 py-4 font-bold text-blue-700">${p.amount.toFixed(2)}</td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="secondary" className="uppercase text-[9px]">{p.payoutMethod}</Badge>
                                                    <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">{p.payoutDetails}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge className={`
                                                        ${p.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                                                        ${p.status === 'paid' ? 'bg-green-100 text-green-700' : ''}
                                                        ${p.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                                                    `}>
                                                        {p.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right space-x-2">
                                                    {p.status === 'pending' && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="text-red-600 h-7" onClick={() => handleUpdatePayout(p._id, 'rejected')}>
                                                                Reject
                                                            </Button>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7" onClick={() => handleUpdatePayout(p._id, 'paid')}>
                                                                Mark as Paid
                                                            </Button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
