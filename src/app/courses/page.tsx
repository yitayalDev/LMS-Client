'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { getMediaUrl } from '@/lib/utils';
import { API_URL } from '@/lib/api';
import StarRating from '@/components/course/StarRating';

export default function CourseCatalog() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/courses`);
                setCourses(data);
            } catch (error) {
                console.error('Failed to fetch courses', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading courses...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Explore Courses</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <p className="text-muted-foreground">No courses available yet.</p>
                ) : (
                    courses.map((course: any) => (
                        <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-gray-200 relative">
                                {course.thumbnail ? (
                                    <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Preview</div>
                                )}
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{course.category}</span>
                                    <span className="text-sm font-bold text-gray-900">${course.price}</span>
                                </div>
                                <CardTitle className="text-xl mt-2 line-clamp-1">{course.title}</CardTitle>
                                <div className="mt-2">
                                    <StarRating
                                        rating={course.ratings?.average || 0}
                                        count={course.ratings?.count || 0}
                                        size="small"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        By <Link href={`/profile/${course.instructor?._id}`} className="hover:underline font-bold text-primary">{course.instructor?.name}</Link>
                                    </span>
                                    <Link href={`/courses/${course.slug}`}>
                                        <Button size="sm">View Details</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
