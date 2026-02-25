'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users, Award, BookOpen, Star, Mail,
    Linkedin, Github, Globe, GraduationCap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMediaUrl } from '@/lib/utils';
import { API_URL } from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';
import StarRating from '@/components/course/StarRating';

export default function InstructorPublicProfile() {
    const { id } = useParams();
    const [instructor, setInstructor] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch public profile info
                const { data } = await axios.get(`${API_URL}/users/public-profile/${id}`);
                setInstructor(data.user);
                setCourses(data.courses);
            } catch (error) {
                console.error('Failed to fetch instructor profile', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-lg">Loading profile...</div>;
    if (!instructor) return <div className="p-8 text-center text-lg">Instructor not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
            {/* Header / Hero Section */}
            <div className="relative">
                <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-blue-600 rounded-3xl" />
                <div className="absolute -bottom-16 left-8 flex flex-col md:flex-row items-end gap-6">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-xl ring-4 ring-primary/10">
                        <AvatarImage src={getMediaUrl(instructor.avatar)} />
                        <AvatarFallback className="text-4xl">{instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="pb-4 space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                            {instructor.name}
                            <Award className="h-6 w-6 text-primary" />
                        </h1>
                        <p className="text-gray-500 font-medium text-lg italic">
                            {instructor.instructorDetails?.topic || 'Expert Instructor'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16">
                {/* Sidebar Info */}
                <div className="space-y-8">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Stats Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm font-medium">Students</span>
                                </div>
                                <span className="font-bold">1.2k+</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-sm font-medium">Courses</span>
                                </div>
                                <span className="font-bold">{courses.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="text-sm font-medium">Rating</span>
                                </div>
                                <span className="font-bold">4.8/5.0</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Connect</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Button variant="outline" className="justify-start gap-3 w-full">
                                <Linkedin className="h-4 w-4 text-[#0077b5]" />
                                LinkedIn Profile
                            </Button>
                            <Button variant="outline" className="justify-start gap-3 w-full">
                                <Globe className="h-4 w-4 text-gray-600" />
                                Portfolio Website
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <GraduationCap className="h-7 w-7 text-primary" />
                            About Me
                        </h2>
                        <div className="prose prose-blue max-w-none text-gray-600 italic leading-relaxed">
                            {instructor.bio || "No biography provided. This instructor is focused on delivering high-quality learning experiences."}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <BookOpen className="h-7 w-7 text-primary" />
                            Course Catalog
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                        {courses.length === 0 && (
                            <p className="text-center py-12 text-gray-400 border-2 border-dashed rounded-2xl">
                                No public courses available at the moment.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
