'use client';

import React, { useEffect, useState } from 'react';
import { gamificationService } from '@/services/gamificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, Flame, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMediaUrl } from '@/lib/utils';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await gamificationService.getLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="p-8 text-center text-lg">Loading Top Students...</div>;

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-8 w-8 text-yellow-500" />;
        if (index === 1) return <Medal className="h-8 w-8 text-gray-400" />;
        if (index === 2) return <Medal className="h-8 w-8 text-amber-600" />;
        return <span className="text-xl font-bold text-gray-500 w-8 text-center">{index + 1}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
                    <Trophy className="h-10 w-10 text-yellow-500" />
                    Global Leaderboard
                </h1>
                <p className="text-lg text-gray-600">
                    Compete, learn, and earn your spot among the top students!
                </p>
            </div>

            <Card className="shadow-xl bg-white/50 backdrop-blur border-0">
                <CardHeader className="border-b bg-gray-50/50 rounded-t-xl">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-500 uppercase tracking-wider px-6">
                        <div className="flex-1">Rank & Student</div>
                        <div className="flex gap-16 text-right">
                            <span className="w-24">Daily Streak</span>
                            <span className="w-24">Total Points</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {leaderboard.map((user, index) => (
                            <div
                                key={user._id}
                                className={`flex items-center justify-between p-6 transition-all hover:bg-gray-50 ${index < 3 ? 'bg-orange-50/30' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="flex items-center justify-center w-12">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                            <AvatarImage src={getMediaUrl(user.avatar)} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                                                {user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                                            {user.badges && user.badges.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {user.badges.slice(0, 3).map((b: any, i: number) => (
                                                        <span key={i} title={b.name} className="text-primary">
                                                            <Award className="h-4 w-4" />
                                                        </span>
                                                    ))}
                                                    {user.badges.length > 3 && (
                                                        <span className="text-xs text-gray-500 font-medium ml-1 flex items-center">
                                                            +{user.badges.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-16 text-right font-medium">
                                    <div className="w-24 flex items-center justify-end gap-1.5">
                                        <Flame className={`h-5 w-5 ${user.loginStreak > 2 ? 'text-orange-500' : 'text-gray-400'}`} />
                                        <span className={`text-lg ${user.loginStreak > 2 ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                                            {user.loginStreak || 0}
                                        </span>
                                    </div>
                                    <div className="w-24 flex items-center justify-end gap-1.5">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xl font-extrabold text-gray-900">
                                            {user.points.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {leaderboard.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No students have earned points yet. Be the first!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
