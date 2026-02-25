'use client';

import React, { useEffect, useState } from 'react';
import { virtualClassroomService } from '@/services/virtualClassroomService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Video, Calendar as CalendarIcon, Clock, ExternalLink,
    User, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMediaUrl } from '@/lib/utils';

dayjs.extend(isBetween);

export default function StudentCalendarPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'today'>('upcoming');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await virtualClassroomService.getMyUpcomingSessions();
                setSessions(data);
            } catch (error) {
                console.error('Failed to fetch sessions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const filteredSessions = sessions.filter(s => {
        const start = dayjs(s.startTime);
        if (filter === 'today') return start.isSame(dayjs(), 'day');
        if (filter === 'upcoming') return start.isAfter(dayjs());
        return true;
    });

    // Group by date
    const groupedSessions = filteredSessions.reduce((acc: any, session: any) => {
        const date = dayjs(session.startTime).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedSessions).sort();

    if (loading) return <div className="p-8 text-center text-lg">Loading your schedule...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <CalendarIcon className="mr-3 h-8 w-8 text-primary" />
                        My Learning Schedule
                    </h1>
                    <p className="text-muted-foreground text-sm">Stay on top of your live classes and interactive labs.</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start">
                    <Button
                        variant={filter === 'upcoming' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('upcoming')}
                        className="text-xs h-8"
                    >
                        Upcoming
                    </Button>
                    <Button
                        variant={filter === 'today' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('today')}
                        className="text-xs h-8"
                    >
                        Today
                    </Button>
                    <Button
                        variant={filter === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="text-xs h-8"
                    >
                        All
                    </Button>
                </div>
            </div>

            <div className="space-y-10">
                {sortedDates.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="py-20 text-center">
                            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No Sessions Found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                                You don't have any live sessions scheduled for the selected filter.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-primary uppercase tracking-wider min-w-[120px]">
                                    {dayjs(date).format('ddd, MMM D')}
                                </span>
                                <div className="h-px bg-gray-200 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 ml-0 md:ml-32">
                                {groupedSessions[date].map((session: any) => (
                                    <Card key={session._id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="p-6 flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-extrabold text-white bg-primary px-1.5 py-0.5 rounded uppercase">
                                                                    {session.platform}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground font-medium">
                                                                    {session.course?.title}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-gray-900 flex items-center justify-end gap-1.5">
                                                                <Clock className="h-4 w-4 text-gray-400" />
                                                                {dayjs(session.startTime).format('h:mm A')}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{session.duration} minutes</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-600 line-clamp-2 italic">
                                                        {session.description || "Interactive live session with your instructor."}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 ring-2 ring-white">
                                                                <AvatarImage src={getMediaUrl(session.instructor?.avatar)} />
                                                                <AvatarFallback>{session.instructor?.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="text-xs">
                                                                <p className="font-bold text-gray-900">{session.instructor?.name}</p>
                                                                <p className="text-gray-500">Instructor</p>
                                                            </div>
                                                        </div>

                                                        <a href={session.joinUrl} target="_blank" rel="noopener noreferrer">
                                                            <Button className="gap-2">
                                                                Enter Classroom
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className={`w-full md:w-2 ${session.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-primary/20'
                                                    }`} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
