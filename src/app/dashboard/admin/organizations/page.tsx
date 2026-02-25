'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, Users, Globe, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// API_URL moved to @/lib/api

export default function OrganizationManagement() {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newOrg, setNewOrg] = useState({ name: '', description: '', domain: '', primaryColor: '#3b82f6' });
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchOrganizations = async () => {
        try {
            const { data } = await api.get(`/organizations/all`);
            setOrganizations(data);
        } catch (error) {
            console.error('Failed to fetch organizations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchOrganizations();
        }
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/organizations`, newOrg);
            setIsCreateOpen(false);
            setNewOrg({ name: '', description: '', domain: '', primaryColor: '#3b82f6' });
            fetchOrganizations();
        } catch (error) {
            console.error('Failed to create organization', error);
        }
    };

    if (user?.role !== 'admin') return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <Building2 className="mr-3 h-8 w-8 text-primary" />
                        Organizations
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage enterprise tenants and multi-tenant isolation.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input
                                    id="name"
                                    value={newOrg.name}
                                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="domain">Associated Domain</Label>
                                <Input
                                    id="domain"
                                    value={newOrg.domain}
                                    onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                                    placeholder="e.g. acme.com (Optional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={newOrg.description}
                                    onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                                    placeholder="Company bio..."
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Enterprise Tenant</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                    <Card key={org._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-lg">{org.name}</CardTitle>
                            </div>
                            <div className="flex space-x-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <Globe className="h-4 w-4" />
                                {org.domain || 'No domain linked'}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <Users className="h-4 w-4" />
                                {org.memberCount || 0} Members
                            </div>
                            <div className="pt-2 border-t flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                <span>Admin: {org.admin?.name || 'System'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {organizations.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed rounded-2xl text-center">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No Organizations Found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Start by creating your first enterprise tenant to enable multi-tenant isolation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
