'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Plus, Calendar, Clock, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// API_URL moved to @/lib/api

export default function InstructorLiveSessions() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [formData, setFormData] = useState({
        course: '',
        title: '',
        description: '',
        startTime: '',
        duration: '60',
        platform: 'zoom'
    });

    const fetchData = async () => {
        try {
            const [coursesRes, sessionsRes] = await Promise.all([
                api.get(`/courses/instructor`),
                api.get(`/virtual-classrooms`)
            ]);
            setCourses(coursesRes.data);
            setSessions(sessionsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/virtual-classrooms`, formData);
            setIsCreateOpen(false);
            setFormData({ course: '', title: '', description: '', startTime: '', duration: '60', platform: 'zoom' });
            fetchData();
        } catch (error) {
            console.error('Failed to create session', error);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/virtual-classrooms/${id}/status`, { status });
            fetchData();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <Video className="mr-3 h-8 w-8 text-primary" />
                        Live Classrooms
                    </h1>
                    <p className="text-muted-foreground text-sm">Schedule and manage your live video sessions.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Live Session</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Select Course</Label>
                                <Select onValueChange={(v: string) => setFormData({ ...formData, course: v })} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Which course is this for?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Session Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Q&A Session: Introduction"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="datetime-local"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (Min)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Platform</Label>
                                <Select onValueChange={(v: string) => setFormData({ ...formData, platform: v })} defaultValue="zoom">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="zoom">Zoom</SelectItem>
                                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                                        <SelectItem value="custom">Custom URL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">Create Meeting</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                    <Card key={session._id} className="relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${session.status === 'live' ? 'bg-red-500' :
                            session.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                            }`} />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">{session.course?.title}</p>
                                    <CardTitle className="text-lg">{session.title}</CardTitle>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${session.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                                    session.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {session.status.toUpperCase()}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm gap-4 text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(session.startTime).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <a
                                    href={session.joinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-2 w-full py-2 bg-gray-50 border rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                >
                                    <span>Open {session.platform} Meeting</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>

                                <div className="flex gap-2">
                                    {session.status === 'scheduled' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => updateStatus(session._id, 'live')}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Start Lab
                                        </Button>
                                    )}
                                    {session.status === 'live' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => updateStatus(session._id, 'completed')}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            End Session
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {sessions.length === 0 && !loading && (
                    <div className="col-span-full py-20 border-2 border-dashed rounded-2xl text-center">
                        <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No Live Sessions Scheduled</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Ready to meet your students? Schedule your first live session above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
