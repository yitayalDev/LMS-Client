'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, XCircle, Clock, Eye, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

// API_URL moved to @/lib/api

function AdminEditCourseForm({ course, onSuccess }: { course: any, onSuccess: () => void }) {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            title: course.title,
            description: course.description,
            category: course.category,
            price: course.price,
            level: course.level
        }
    });

    const onSubmit = async (data: any) => {
        try {
            await api.patch(`/courses/${course._id}`, data);
            alert('Course updated successfully.');
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update course.');
            console.error('Failed to update course', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description', { required: 'Description is required' })} />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" {...register('category', { required: 'Category is required' })} />
                </div>
                <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" {...register('price', { required: 'Price is required' })} />
                </div>
            </div>
            <div>
                <Label htmlFor="level">Level</Label>
                <select
                    id="level"
                    {...register('level')}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
        </form>
    );
}

export default function CourseApproval() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<any>(null);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get(`/courses`);
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/courses/${id}/approve`, {});
            fetchCourses(); // Refresh list
        } catch (error) {
            console.error('Failed to approve course', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.patch(`/courses/${id}/reject`, {});
            fetchCourses(); // Refresh list
        } catch (error) {
            console.error('Failed to reject course', error);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchCourses();
        }
    }, [user]);

    if (user?.role !== 'admin') return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <BookOpen className="mr-3 h-8 w-8 text-primary" />
                        Course Management
                    </h1>
                    <p className="text-muted-foreground text-sm">Review, approve, and manage all curriculum submitted by instructors.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {courses.map((course) => (
                    <Card key={course._id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-64 bg-gray-100 flex items-center justify-center p-8">
                                <BookOpen className="h-12 w-12 text-gray-400" />
                            </div>
                            <div className="flex-1 p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground">by {course.instructor?.name || 'Unknown Instructor'}</p>
                                    </div>
                                    <Badge variant="outline" className={`${course.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'} uppercase text-[10px] font-bold`}>
                                        {course.isApproved ? 'Approved' : 'Pending Review'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> Status: {course.status}</span>
                                    <span className="flex items-center font-bold text-primary"><Eye className="h-3 w-3 mr-1" /> View Modules</span>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Dialog open={editingCourse?._id === course._id} onOpenChange={(open) => !open && setEditingCourse(null)}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Course Details</DialogTitle>
                                            </DialogHeader>
                                            {editingCourse && <AdminEditCourseForm course={editingCourse} onSuccess={() => { setEditingCourse(null); fetchCourses(); }} />}
                                        </DialogContent>
                                    </Dialog>

                                    {!course.isApproved && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleReject(course._id)}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprove(course._id)}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve Course
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {courses.length === 0 && !loading && (
                    <div className="py-20 bg-gray-50 border-2 border-dashed rounded-2xl text-center">
                        <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Queue Clear</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">There are no courses currently awaiting administrative approval.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
