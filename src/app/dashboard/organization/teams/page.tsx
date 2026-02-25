'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, UserPlus, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function TeamManagement() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: '' // In a real app, this would be a search/select
    });

    const fetchTeams = async () => {
        try {
            const res = await api.get('/teams/organization');
            setTeams(res.data);
        } catch (error) {
            console.error('Failed to fetch teams', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchTeams();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/teams', formData);
            setIsCreateOpen(false);
            setFormData({ name: '', description: '', managerId: '' });
            fetchTeams();
        } catch (error) {
            console.error('Failed to create team', error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Team Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Structure your organization into learning teams.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Team
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Team</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Team Name</label>
                                <Input
                                    placeholder="e.g. Engineering"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="Brief description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Manager Email/ID</label>
                                <Input
                                    placeholder="User ID for manager"
                                    value={formData.managerId}
                                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">The assigned user will receive the 'Manager' role.</p>
                            </div>
                            <Button type="submit" className="w-full">Create Team</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Active Teams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">Loading teams...</TableCell>
                                    </TableRow>
                                ) : teams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No teams created yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teams.map((team) => (
                                        <TableRow key={team._id}>
                                            <TableCell className="font-medium">{team.name}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{team.manager?.name}</div>
                                                <div className="text-xs text-muted-foreground">{team.manager?.email}</div>
                                            </TableCell>
                                            <TableCell>{team.members.length} members</TableCell>
                                            <TableCell className="text-xs">{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Add Members
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                <Info className="h-6 w-6 text-blue-500 shrink-0" />
                <div className="space-y-1">
                    <h4 className="font-semibold text-blue-900">About Teams</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                        Teams allow you to group your organization's learners and assign a manager to oversee their progress.
                        Managers have access to team-specific analytics and can help ensure their team stays on track with mandatory training.
                    </p>
                </div>
            </div>
        </div>
    );
}
