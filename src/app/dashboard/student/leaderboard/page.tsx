'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Star, Target } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';
// API_URL moved to @/lib/api

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get(`/gamification/leaderboard`);
                setPlayers(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading leaderboard...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold flex items-center justify-center">
                    <Trophy className="mr-3 h-10 w-10 text-yellow-500" />
                    Top Students
                </h1>
                <p className="text-muted-foreground">Compete, learn, and grow together!</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {players.map((player, index) => {
                    const isTop3 = index < 3;
                    const rankColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-400';

                    return (
                        <Card key={player._id} className={`${isTop3 ? 'border-2 border-primary/20 bg-primary/5' : ''}`}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className={`text-2xl font-black w-8 text-center ${rankColor}`}>
                                        {index + 1}
                                    </div>
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={getMediaUrl(player.avatar)} />
                                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg">{player.name}</p>
                                        <div className="flex space-x-2 mt-1">
                                            {player.badges.slice(0, 3).map((b: any, i: number) => (
                                                <div key={i} title={b.badge.name} className="bg-white p-1 rounded-full border shadow-sm">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            ))}
                                            {player.badges.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground">+{player.badges.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary flex items-center justify-end">
                                        {player.points}
                                        <Target className="ml-2 h-5 w-5 opacity-40" />
                                    </div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Points</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {players.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
                        <Medal className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-500">No data available yet. Start learning to climb the ranks!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
