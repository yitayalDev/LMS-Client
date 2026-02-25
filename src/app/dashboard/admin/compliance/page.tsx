'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle, XCircle, Clock, Users, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ExportButton } from '@/components/reporting/ExportButton';

interface ComplianceSummary {
    summary: {
        compliant: number;
        expiring_soon: number;
        expired: number;
        not_started: number;
    };
    mandatoryCourseCount: number;
    totalComplianceRate: number;
}

export default function ComplianceDashboard() {
    const router = useRouter();
    const [data, setData] = useState<ComplianceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/compliance/summary');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch compliance data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading Compliance Data...
            </div>
        </div>
    );

    const summary = data?.summary || { compliant: 0, expiring_soon: 0, expired: 0, not_started: 0 };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="text-white">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-white">Organization Compliance</h1>
                </div>
                <ExportButton type="compliance" label="Export Compliance Report" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-green-500/5 border-green-500/20 shadow-lg shadow-green-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-400 uppercase tracking-wider">Compliant</CardTitle>
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{summary.compliant}</div>
                        <p className="text-xs text-green-600/70 mt-1">Certificates up-to-date</p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5 border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-400 uppercase tracking-wider">Expiring Soon</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{summary.expiring_soon}</div>
                        <p className="text-xs text-yellow-600/70 mt-1">Within 30 day window</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-400 uppercase tracking-wider">Expired</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{summary.expired}</div>
                        <p className="text-xs text-red-600/70 mt-1">Critical compliance gaps</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-800/10 border-zinc-700/50 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Not Started</CardTitle>
                        <XCircle className="h-5 w-5 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{summary.not_started}</div>
                        <p className="text-xs text-zinc-500 mt-1">Assigned mandatory training</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                <CardHeader>
                    <CardTitle className="text-white">Organization-Wide Compliance Rate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Target: 100% Completion</span>
                            <span className="text-white font-mono text-lg">{data?.totalComplianceRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={data?.totalComplianceRate} className="h-3 bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-500">Mandatory Courses</p>
                            <p className="text-2xl font-bold text-white">{data?.mandatoryCourseCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-500">Active Certifications</p>
                            <p className="text-2xl font-bold text-white">{summary.compliant + summary.expiring_soon}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-500">Total Workers Tracked</p>
                            <p className="text-2xl font-bold text-white">---</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-500">Last Calculation</p>
                            <p className="text-xs font-mono text-zinc-400">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
