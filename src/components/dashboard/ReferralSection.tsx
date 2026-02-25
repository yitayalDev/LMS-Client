'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Copy, Check, Users, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';

export const ReferralSection = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await referralService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch referral stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const copyToClipboard = () => {
        const url = `${window.location.origin}/register?ref=${stats.referralCode}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div>Loading referral rewards...</div>;

    return (
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Gift className="h-6 w-6 text-primary" />
                        Refer & Earn
                    </CardTitle>
                    <p className="text-sm text-gray-500 font-medium">Invite friends and earn points for every referral!</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Referral Link</label>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border group">
                                <span className="text-xs font-mono truncate flex-1 text-gray-600">
                                    {window.location.origin}/register?ref={stats?.referralCode}
                                </span>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 group-hover:text-primary transition-colors" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-around p-4 bg-white rounded-xl border border-primary/10 shadow-sm">
                            <div className="text-center">
                                <p className="text-2xl font-black text-primary">{stats?.referralCount || 0}</p>
                                <p className="text-[10px] font-bold uppercase text-gray-400">Total Referrals</p>
                            </div>
                            <div className="h-10 w-px bg-gray-100" />
                            <div className="text-center">
                                <p className="text-2xl font-black text-green-600">+{stats?.totalPoints || 0}</p>
                                <p className="text-[10px] font-bold uppercase text-gray-400">Points Earned</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Recent Referrals
                        </h4>
                        <div className="space-y-2">
                            {stats?.referrals.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm italic">
                                    No referrals yet. Start sharing to earn!
                                </div>
                            ) : (
                                stats.referrals.slice(0, 3).map((ref: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-transparent hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                {ref.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{ref.name}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(ref.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600">+50 points</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-medium text-gray-500">50 pts per Friend</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-[10px] font-medium text-gray-500">25 pts for Joining</span>
                        </div>
                    </div>
                    <Button variant="link" className="text-xs h-auto p-0 gap-1">
                        How it works <ExternalLink className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
