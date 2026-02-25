'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Calendar as CalendarIcon, Clock, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { virtualClassroomService } from '@/services/virtualClassroomService';
import dayjs from 'dayjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMediaUrl } from '@/lib/utils';

export const UpcomingSessions = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await virtualClassroomService.getMyUpcomingSessions();
                setSessions(data);
            } catch (error) {
                console.error('Failed to fetch upcoming sessions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    if (loading) return <div>Loading sessions...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                    <Video className="mr-2 h-5 w-5 text-purple-500" />
                    Upcoming Live Sessions
                </CardTitle>
                <Link href="/dashboard/student/calendar" className="text-xs text-primary hover:underline">
                    View Calendar
                </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        No upcoming live sessions scheduled.
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session._id} className="p-4 border rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900">{session.title}</h4>
                                    <p className="text-xs text-primary font-medium">{session.course?.title}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${session.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {dayjs(session.startTime).format('MMM D, YYYY')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {dayjs(session.startTime).format('h:mm A')} ({session.duration}m)
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={getMediaUrl(session.instructor?.avatar)} />
                                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] text-gray-500 font-medium">By {session.instructor?.name}</span>
                                </div>
                                <a href={session.joinUrl} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant={session.status === 'live' ? 'default' : 'outline'} className="h-8 text-xs">
                                        {session.status === 'live' ? 'Join Now' : 'View Link'}
                                        <ExternalLink className="ml-1.5 h-3 w-3" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

// Sub-component for Link since it's not imported in the logic above but used in the JSX
import Link from 'next/link';
