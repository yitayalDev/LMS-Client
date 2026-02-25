'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function LiveSessions({ courseId }: { courseId: string }) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const { data } = await api.get(`/virtual-classrooms/course/${courseId}`);
                setSessions(data);
            } catch (error) {
                console.error('Failed to fetch live sessions', error);
            } finally {
                setLoading(false);
            }
        };
        if (courseId && user) fetchSessions();
    }, [courseId, user]);

    if (loading) return <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Checking for live sessions...</div>;

    if (sessions.length === 0) return null;

    return (
        <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center">
                    <Video className="mr-2 h-4 w-4 text-primary" />
                    Live Class Schedule
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                {sessions.map((session) => (
                    <div key={session._id} className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">{session.title}</p>
                            <div className="flex items-center text-[10px] text-muted-foreground space-x-3">
                                <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(session.startTime).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {session.status === 'live' ? (
                                <a
                                    href={session.joinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse flex items-center"
                                >
                                    JOIN LIVE
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                            ) : (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
                                    {session.status.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
