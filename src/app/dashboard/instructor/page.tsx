'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, PlusCircle, Layout, ListChecks, TrendingUp, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// API_URL moved to @/lib/api

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [showStudentsModal, setShowStudentsModal] = useState(false);

    const handleViewStudents = async (course: any) => {
        setSelectedCourse(course);
        setShowStudentsModal(true);
        setLoadingStudents(true);
        try {
            const { data } = await api.get(`/enrollments/course/${course._id}/students`);
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.patch(`/courses/${id}/status`, { status: 'published' });
            // Refresh courses
            const coursesRes = await api.get(`/courses/instructor`);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Failed to publish course', error);
        }
    };

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const [statsRes, coursesRes] = await Promise.all([
                    api.get(`/analytics/instructor`),
                    api.get(`/courses/instructor`)
                ]);
                setStats(statsRes.data);
                setCourses(coursesRes.data);
            } catch (error) {
                console.error('Failed to fetch instructor dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchInstructorData();
    }, [user]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = stats?.revenue.map((r: any) => ({
        month: monthNames[r._id - 1],
        amount: r.total
    })) || [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
                <div className="flex space-x-4">
                    <Link href="/dashboard/instructor/live-sessions">
                        <Button variant="outline">
                            <Video className="mr-2 h-4 w-4" />
                            Manage Live Classes
                        </Button>
                    </Link>
                    <Link href="/dashboard/instructor/earnings">
                        <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Earnings & Payouts
                        </Button>
                    </Link>
                    <Link href="/courses/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Course
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats?.revenue.reduce((acc: number, curr: any) => acc + curr.total, 0).toFixed(2) || '0.00'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                            Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Layout className="mr-2 h-5 w-5 text-blue-500" />
                            Students per Course
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.enrollments || []}>
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading your courses...</p>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            You haven't created any courses yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {courses.map((course: any) => (
                                <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                                            <Layout className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{course.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {course.category} •
                                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${course.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {course.status} {course.isApproved ? '(Approved)' : '(Pending)'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {course.status === 'draft' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handlePublish(course._id)}
                                            >
                                                Publish
                                            </Button>
                                        )}
                                        <Link href={`/dashboard/instructor/exams/create?courseId=${course._id}`}>
                                            <Button variant="outline" size="sm">
                                                <ListChecks className="mr-2 h-4 w-4" /> Add Exam
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm" onClick={() => handleViewStudents(course)}>
                                            <Users className="mr-2 h-4 w-4" /> Students
                                        </Button>
                                        <Link href={`/dashboard/instructor/courses/${course._id}/materials`}>
                                            <Button variant="outline" size="sm">
                                                <BookOpen className="mr-2 h-4 w-4" /> Materials
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showStudentsModal} onOpenChange={setShowStudentsModal}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Enrolled Students - {selectedCourse?.title}</DialogTitle>
                        <DialogDescription>
                            List of all students currently enrolled in this course.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="pr-4">
                        <div className="space-y-4 py-4">
                            {loadingStudents ? (
                                <p className="text-center py-4">Loading student list...</p>
                            ) : students.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">No students enrolled yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {students.map((enrollment: any) => (
                                        <div key={enrollment._id} className="p-4 border rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                        {enrollment.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">{enrollment.user.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="secondary">{enrollment.progress}% Progress</Badge>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {enrollment.formData && (
                                                <div className="bg-gray-50 p-3 rounded-md text-sm border">
                                                    <p className="font-semibold mb-2 text-xs uppercase text-gray-500">Form Responses:</p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Level:</p>
                                                            <p className="capitalize">{enrollment.formData.experience}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Phone:</p>
                                                            <p>{enrollment.formData.phone}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-xs text-muted-foreground">Goals:</p>
                                                            <p className="italic">"{enrollment.formData.goals}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
