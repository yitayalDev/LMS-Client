'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Users, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BillingData {
    organization: {
        name: string;
        maxSeats: number;
        userCount: number;
    };
    subscription: {
        planId: string;
        status: string;
        currentPeriodEnd: string;
        cancelAtPeriodEnd: boolean;
    } | null;
}

export default function OrganizationBilling() {
    const [data, setData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                // We'll need a new endpoint or update organization fetch to include these
                const response = await api.get('/organizations/my-billing');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch billing data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBilling();
    }, []);

    const handleManageBilling = async () => {
        try {
            const response = await api.post('/billing/portal');
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Failed to open billing portal', error);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Billing Info...</div>;

    const planNames: { [key: string]: string } = {
        starter: 'Starter Plan',
        pro: 'Professional Plan',
        enterprise: 'Enterprise Plan'
    };

    const seatPercentage = data ? (data.organization.userCount / data.organization.maxSeats) * 100 : 0;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <CreditCard className="h-5 w-5 text-purple-500" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>Manage your organization's subscription</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {data?.subscription ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-2xl font-bold text-white uppercase">{planNames[data.subscription.planId] || 'Custom Plan'}</p>
                                        <p className="text-sm text-zinc-400">Status: <span className="text-green-500 font-medium capitalize">{data.subscription.status}</span></p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${data.subscription.cancelAtPeriodEnd ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {data.subscription.cancelAtPeriodEnd ? 'Expires Soon' : 'Auto-Renew'}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <p className="text-xs text-zinc-500">Next billing date: {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</p>
                                    <Button onClick={handleManageBilling} className="w-full bg-white text-black hover:bg-zinc-200">
                                        Manage in Stripe
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <AlertCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-400 mb-4">No active subscription found.</p>
                                <Button onClick={() => window.location.href = '/pricing'}>View Plans</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Users className="h-5 w-5 text-blue-500" />
                            Seat Usage
                        </CardTitle>
                        <CardDescription>Members currently in your organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Total Seats Used</span>
                                <span className="text-white font-bold">{data?.organization.userCount} / {data?.organization.maxSeats}</span>
                            </div>
                            <Progress value={seatPercentage} className="h-3 bg-white/5" />
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                {seatPercentage >= 90 ? (
                                    <span className="text-orange-500 font-medium">You are almost at your seat limit. Upgrade to add more members.</span>
                                ) : (
                                    'You can add more members to your organization until you reach the seat limit.'
                                )}
                            </p>
                            {seatPercentage >= 80 && (
                                <Button variant="outline" className="w-full mt-4 border-zinc-700" onClick={() => window.location.href = '/pricing'}>
                                    Upgrade Seats
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
