'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import ModuleList from '@/components/dashboard/instructor/ModuleList';
import ModuleForm from '@/components/dashboard/instructor/CourseModuleForm';
import { toast } from 'sonner';

export default function ManageCourse() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [editingModule, setEditingModule] = useState<any>(null);

    const fetchCourse = useCallback(async () => {
        try {
            const response = await api.get(`/courses/${courseId}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Failed to fetch course', error);
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) fetchCourse();
    }, [courseId, fetchCourse]);

    const handleAddModule = async (data: any) => {
        try {
            await api.post(`/courses/${courseId}/modules`, data);
            toast.success('Module added successfully');
            setIsAddingModule(false);
            fetchCourse();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add module');
        }
    };

    const handleUpdateModule = async (data: any) => {
        try {
            await api.put(`/courses/${courseId}/modules/${editingModule._id}`, data);
            toast.success('Module updated successfully');
            setEditingModule(null);
            fetchCourse();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update module');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure you want to delete this module?')) return;
        try {
            await api.delete(`/courses/${courseId}/modules/${moduleId}`);
            toast.success('Module deleted successfully');
            fetchCourse();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete module');
        }
    };

    const handleDeleteCourse = async () => {
        if (!confirm('CRITICAL: Are you sure you want to delete this ENTIRE course? This action cannot be undone and will delete all modules, materials, enrollments, and reviews.')) return;
        try {
            await api.delete(`/courses/${courseId}`);
            toast.success('Course deleted successfully');
            router.push('/dashboard/instructor/courses');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete course');
        }
    };

    if (loading) return <div className="p-8">Loading course details...</div>;
    if (!course) return <div className="p-8">Course not found</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddingModule || !!editingModule} onOpenChange={(open) => {
                        if (!open) {
                            setIsAddingModule(false);
                            setEditingModule(null);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsAddingModule(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Module
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingModule ? 'Edit Module' : 'New Module'}</DialogTitle>
                            </DialogHeader>
                            <ModuleForm
                                courseId={courseId}
                                moduleId={editingModule?._id}
                                initialData={editingModule}
                                onSubmit={editingModule ? handleUpdateModule : handleAddModule}
                                onCancel={() => {
                                    setIsAddingModule(false);
                                    setEditingModule(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Course Curriculum</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ModuleList
                                modules={course.modules || []}
                                onEdit={setEditingModule}
                                onDelete={handleDeleteModule}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">


                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Visibility</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {course.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Approval</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${course.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {course.isApproved ? 'Approved' : 'Pending'}
                                </span>
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full mt-4"
                                onClick={handleDeleteCourse}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Course
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
