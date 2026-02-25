'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, CheckCircle2, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMediaUrl } from '@/lib/utils';
import AIChat from '@/components/course/AIChat';
import LiveSessions from '@/components/course/LiveSessions';
import CourseDiscussion from '@/components/course/CourseDiscussion';

// API_URL moved to @/lib/api

export default function LearningView() {
    const { slug } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [activeModule, setActiveModule] = useState<any>(null);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedModules, setCompletedModules] = useState<string[]>([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch course details by slug
                const courseRes = await api.get(`/courses/details/${slug}`);
                const courseData = courseRes.data;
                setCourse(courseData);

                // Fetch enrollment progress
                try {
                    const enrollRes = await api.get(`/enrollments/course/${courseData._id}`);
                    setCompletedModules(enrollRes.data.completedModules || []);
                } catch (e) {
                    console.error('Failed to fetch enrollment progress');
                }

                // Fetch exams for this course
                const examsRes = await api.get(`/exams/course/${courseData._id}`);
                setExams(examsRes.data);

                // Pick first module as default
                if (courseData.modules?.length > 0) {
                    setActiveModule(courseData.modules.sort((a: any, b: any) => a.order - b.order)[0]);
                }
            } catch (error) {
                console.error('Failed to fetch learning data', error);
            } finally {
                setLoading(false);
            }
        };
        if (slug && user) fetchCourseData();
    }, [slug, user]);

    const handleModuleComplete = async (moduleId: string) => {
        try {
            await api.post(`/enrollments/course/${course._id}/complete-module`, { moduleId });
            setCompletedModules(prev => [...prev, moduleId]);
        } catch (error) {
            console.error('Failed to complete module', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading your classroom...</div>;
    if (!course) return <div className="p-8 text-center">Classroom not found.</div>;

    const sortedModules = [...(course.modules || [])].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
            {/* Content Area */}
            <div className="flex-1 bg-black p-4 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden relative">
                    {!activeModule ? (
                        <div className="text-white text-center">
                            <h2 className="text-2xl font-bold">No modules available</h2>
                            <p className="text-gray-400">This course doesn't have any content yet.</p>
                        </div>
                    ) : activeModule.contentType === 'video' ? (
                        <video
                            src={getMediaUrl(activeModule.contentData?.url)}
                            controls
                            className="max-h-full w-full"
                            poster={getMediaUrl(course.thumbnail)}
                            onEnded={() => handleModuleComplete(activeModule._id)}
                        />
                    ) : (
                        <div className="text-white text-center p-8 w-full max-w-4xl">
                            <h2 className="text-3xl font-bold mb-4">{activeModule.title}</h2>
                            <p className="text-gray-400 mb-8">{activeModule.description}</p>

                            <div className="bg-white text-black p-8 rounded-xl shadow-2xl text-left overflow-y-auto max-h-[60vh]">
                                {activeModule.contentType === 'document' && (
                                    <div className="space-y-4">
                                        <p>Document Content Link:</p>
                                        <a href={getMediaUrl(activeModule.contentData?.url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            View PDF / Document
                                        </a>
                                    </div>
                                )}
                                {activeModule.contentType === 'quiz' && (
                                    <div className="text-center">
                                        <p className="mb-4">Quiz: {activeModule.contentData?.title}</p>
                                        <Button onClick={() => router.push(`/learn/${slug}/quiz/${activeModule._id}`)}>
                                            Take Quiz Now
                                        </Button>
                                    </div>
                                )}
                                {activeModule.contentType === 'assignment' && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold">Assignment Instructions</h3>
                                        <p>{activeModule.contentData?.instructions}</p>
                                        <div className="pt-4 border-t">
                                            <Button variant="outline">Submit Assignment</Button>
                                        </div>
                                    </div>
                                )}
                                {activeModule.contentType === 'live-session' && (
                                    <div className="text-center">
                                        <p className="mb-4">This module includes a live session.</p>
                                        <Button asChild>
                                            <a href={activeModule.contentData?.link} target="_blank" rel="noopener noreferrer">
                                                Join Live Session (External)
                                            </a>
                                        </Button>
                                    </div>
                                )}

                                <div className="mt-8 pt-8 border-t flex justify-end">
                                    <Button
                                        onClick={() => handleModuleComplete(activeModule._id)}
                                        disabled={completedModules.includes(activeModule._id)}
                                    >
                                        {completedModules.includes(activeModule._id) ? 'Completed' : 'Mark as Completed'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="py-6 px-4 bg-white rounded-b-lg mt-4">
                    <h2 className="text-2xl font-bold">{activeModule?.title || 'Course Home'}</h2>
                    <p className="text-gray-600 mt-2">{course.title}</p>
                </div>

                {/* Course Q&A / Discussions Section */}
                {activeModule && user && (
                    <div className="mt-8">
                        <CourseDiscussion
                            courseId={course._id}
                            moduleId={activeModule._id}
                            currentUser={user}
                        />
                    </div>
                )}
            </div>

            {/* Curriculum Sidebar */}
            <div className="w-full lg:w-96 border-l bg-gray-50 overflow-y-auto max-h-[calc(100vh-64px)]">
                <div className="p-4 border-b bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg">Course Content</h3>
                </div>

                <div className="divide-y">
                    {sortedModules.map((module: any, idx: number) => {
                        const isCompleted = completedModules.includes(module._id);
                        const isLocked = course.isMandatory && idx > 0 && !completedModules.includes(sortedModules[idx - 1]._id);
                        const isActive = activeModule?._id === module._id;

                        return (
                            <button
                                key={module._id}
                                disabled={isLocked}
                                onClick={() => setActiveModule(module)}
                                className={`w-full p-4 flex items-center space-x-3 text-left transition-colors relative ${isActive ? 'bg-blue-50 border-l-4 border-primary' : 'bg-white hover:bg-gray-50'
                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="relative">
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <PlayCircle className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                                        {module.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span className="capitalize">{module.contentType}</span>
                                        {module.duration > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{module.duration} min</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {isLocked && (
                                    <div className="text-gray-400">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {exams.length > 0 && (
                        <div className="mt-8">
                            <div className="p-4 bg-gray-100 font-medium text-sm flex items-center justify-between">
                                <span>Assessments</span>
                            </div>
                            <div className="bg-white">
                                {exams.map((exam) => (
                                    <button
                                        key={exam._id}
                                        onClick={() => router.push(`/learn/${slug}/exam/${exam._id}`)}
                                        className="w-full p-4 flex items-center space-x-3 text-left hover:bg-orange-50 transition-colors border-l-4 border-transparent"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{exam.title}</p>
                                            <p className="text-xs text-muted-foreground">{exam.questions.length} Questions</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AIChat
                courseId={course._id}
                context={`Course: ${course.title}. Active Module: ${activeModule?.title}. Content: ${activeModule?.description || 'Module content'}`}
            />
        </div>
    );
}
