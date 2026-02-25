'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Edit, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// API_URL moved to @/lib/api

export default function InstructorCourses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get(`/courses/instructor`);
                setCourses(response.data);
            } catch (error) {
                console.error('Failed to fetch courses', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCourses();
    }, [user]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <BookOpen className="mr-3 h-8 w-8 text-primary" />
                        My Courses
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage your course catalog</p>
                </div>
                <Link href="/courses/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Course
                    </Button>
                </Link>
            </div>

            {loading ? (
                <p>Loading courses...</p>
            ) : courses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                        <p className="text-muted-foreground mb-4">Start creating your first course to share your knowledge</p>
                        <Link href="/courses/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Course
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any) => (
                        <Card key={course._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        course.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {course.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Users className="h-4 w-4 mr-1" />
                                        {course.enrolledCount || 0} students
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        ${course.price}
                                    </div>
                                </div>
                                <Link href={`/dashboard/instructor/courses/${course._id}`}>
                                    <Button variant="outline" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Manage Course
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
