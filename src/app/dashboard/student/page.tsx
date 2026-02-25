'use client';

import React, { useEffect, useState } from 'react';
import api, { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Trophy, Clock, PlayCircle, BarChart2, Star, Medal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions';
import { ReferralSection } from '@/components/dashboard/ReferralSection';


// API_URL imported from @/lib/api

export default function StudentDashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [enrRes, certRes, statsRes] = await Promise.all([
                    api.get(`/enrollments/my-courses`),
                    api.get(`/certificates/my-certificates`),
                    api.get(`/analytics/student`)
                ]);
                setEnrollments(enrRes.data);
                setCertificates(certRes.data);
                setStats(statsRes.data);

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchDashboardData();
    }, [user]);

    const completedCourses = enrollments.filter((e: any) => e.progress === 100).length;



    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Hello, {user?.name}</h1>
                <Link href="/dashboard/student/leaderboard">
                    <Button variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Leaderboard
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCourses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">LMS Points</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.points || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <UpcomingSessions />


            <ReferralSection />

            {stats?.badges && stats.badges.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center">
                        <Medal className="mr-2 h-5 w-5 text-primary" />
                        My Badges
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {stats.badges.map((b: any, i: number) => (
                            <div key={i} className="flex flex-col items-center p-3 bg-white rounded-xl border shadow-sm w-24 text-center">
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                    <Trophy className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold truncate w-full">{b.badge?.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                            Exam Scores
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.exams || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p>Loading your courses...</p>
                        ) : enrollments.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No active learning progress.
                            </div>
                        ) : (
                            enrollments.slice(0, 3).map((enr: any) => (
                                <Link key={enr._id} href={`/learn/${enr.course?.slug}`} className="block group">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center truncate">
                                                <span className="font-medium truncate max-w-[200px] group-hover:text-primary transition-colors">{enr.course?.title}</span>
                                                {enr.complianceStatus && enr.complianceStatus !== 'not_started' && (
                                                    <span className={`ml-2 px-1.5 py-0.5 text-[8px] rounded-full font-bold uppercase flex-shrink-0 ${enr.complianceStatus === 'compliant' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                        enr.complianceStatus === 'expiring_soon' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                                        }`}>
                                                        {enr.complianceStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            <span>{enr.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${enr.progress}%` }}></div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                        <Link href="/dashboard/student/courses" className="block pt-2 text-center text-sm text-primary hover:underline">
                            View All Courses
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                    {certificates.length === 0 ? (
                        <p className="text-center py-6 text-muted-foreground">Complete assessments to earn certificates.</p>
                    ) : (
                        <div className="space-y-3">
                            {certificates.map((cert: any) => (
                                <div key={cert._id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-bold">{cert.course?.title}</p>
                                            <p className="text-xs text-muted-foreground">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`${API_URL.replace('/api', '')}/certificates/download/${cert._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors"
                                    >
                                        Download PDF
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
