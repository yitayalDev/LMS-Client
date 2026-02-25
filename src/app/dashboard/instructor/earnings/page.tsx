'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wallet, ArrowUpCircle, History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// API_URL moved to @/lib/api

export default function EarningsPage() {
    const { user } = useAuth();
    const [financeData, setFinanceData] = useState<any>(null);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestAmount, setRequestAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'bank_transfer'>('paypal');
    const [payoutDetails, setPayoutDetails] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
    const [showPayoutDialog, setShowPayoutDialog] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, payoutsRes] = await Promise.all([
                api.get(`/payouts/instructor-stats`),
                api.get(`/payouts/my-payouts`)
            ]);
            setFinanceData(statsRes.data);
            setPayouts(payoutsRes.data);
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        try {
            await api.post(`/payouts/request`, {
                amount: Number(requestAmount),
                payoutMethod,
                payoutDetails
            });
            alert('Payout request submitted successfully!');
            setShowPayoutDialog(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to request payout');
        } finally {
            setIsRequesting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading financials...</div>;

    const stats = financeData?.stats || { totalEarnings: 0, totalSales: 0, count: 0 };
    const balance = financeData?.balance || 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Earnings & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Available Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">${balance.toFixed(2)}</div>
                        <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" disabled={balance < 5}>
                                    <ArrowUpCircle className="mr-2 h-4 w-4" /> Withdraw Funds
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request Payout</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleRequestPayout} className="space-y-4 pt-4">
                                    <div>
                                        <Label>Amount (USD)</Label>
                                        <Input
                                            type="number"
                                            min="5"
                                            max={balance}
                                            value={requestAmount}
                                            onChange={(e) => setRequestAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Minimum withdrawal: $5.00</p>
                                    </div>
                                    <div>
                                        <Label>Payout Method</Label>
                                        <select
                                            className="w-full h-10 px-3 py-2 border rounded-md text-sm"
                                            value={payoutMethod}
                                            onChange={(e: any) => setPayoutMethod(e.target.value)}
                                        >
                                            <option value="paypal">PayPal</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>{payoutMethod === 'paypal' ? 'PayPal Email' : 'Bank Details'}</Label>
                                        <Input
                                            value={payoutDetails}
                                            onChange={(e) => setPayoutDetails(e.target.value)}
                                            placeholder={payoutMethod === 'paypal' ? 'email@example.com' : 'IBAN / Swift Code'}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isRequesting}>
                                        {isRequesting ? 'Submitting...' : 'Confirm Withdrawal'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Net after 20% platform fee</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <History className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.count}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all published courses</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                    {payouts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No payout history found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {payouts.map((p) => (
                                        <tr key={p._id}>
                                            <td className="px-4 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 font-bold">${p.amount.toFixed(2)}</td>
                                            <td className="px-4 py-4 uppercase text-[10px]">{p.payoutMethod.replace('_', ' ')}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`
                                                    ${p.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                    ${p.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                    ${p.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                    ${p.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                `}>
                                                    {p.status}
                                                </Badge>
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
    );
}
