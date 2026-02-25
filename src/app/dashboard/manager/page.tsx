'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';

export default function ManagerDashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/teams/analytics');
                setAnalytics(res.data);
            } catch (error) {
                console.error('Failed to fetch team analytics', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAnalytics();
    }, [user]);

    if (loading) return <div className="p-8">Loading team analytics...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    Team Dashboard: {analytics?.teamName}
                </h1>
                <p className="text-muted-foreground">Monitor your team's learning progress and performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.memberCount}</div>
                        <p className="text-xs text-muted-foreground">Active Learners</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(analytics?.stats?.reduce((acc: any, curr: any) => acc + curr.averageProgress, 0) / (analytics?.memberCount || 1)).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Course Completion Rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.stats?.reduce((acc: any, curr: any) => acc + curr.courseCount, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Active Courses</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Active Courses</TableHead>
                                <TableHead>Avg. Progress</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics?.stats?.map((member: any) => (
                                <TableRow key={member._id}>
                                    <TableCell>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">{member.email}</div>
                                    </TableCell>
                                    <TableCell>{member.courseCount}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${member.averageProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium">{member.averageProgress.toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${member.averageProgress > 80 ? 'bg-green-100 text-green-600' :
                                                member.averageProgress > 40 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {member.averageProgress > 80 ? 'EXCEL' : member.averageProgress > 40 ? 'ACTIVE' : 'STARTING'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
