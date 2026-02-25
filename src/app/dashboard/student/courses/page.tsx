'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PlayCircle, BarChart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// API_URL moved to @/lib/api

export default function StudentCourses() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const { data } = await api.get(`/enrollments/my-courses`);
                setEnrollments(data);
            } catch (error) {
                console.error('Failed to fetch enrollments', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchEnrollments();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your courses...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Enrolled Courses</h1>
                <Link href="/courses">
                    <Button>Browse More</Button>
                </Link>
            </div>

            {enrollments.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>You haven't enrolled in any courses yet.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enr: any) => (
                        <Card key={enr._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-gray-200 relative">
                                {enr.course?.thumbnail ? (
                                    <img src={enr.course.thumbnail} alt={enr.course.title} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Preview</div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                                    {enr.progress}% Done
                                </div>
                            </div>
                            <CardHeader>
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{enr.course?.category}</span>
                                <CardTitle className="text-xl mt-1 line-clamp-1">{enr.course?.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${enr.progress}%` }}></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">By {enr.course?.instructor?.name || 'Instructor'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/student/courses/${enr.course?._id}/materials`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <BookOpen className="mr-2 h-4 w-4" /> Resources
                                            </Button>
                                        </Link>
                                        <Link href={`/learn/${enr.course?.slug}`} className="flex-1">
                                            <Button size="sm" className="w-full space-x-1">
                                                <PlayCircle className="h-4 w-4" />
                                                <span>{enr.progress > 0 ? 'Continue' : 'Start'}</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
