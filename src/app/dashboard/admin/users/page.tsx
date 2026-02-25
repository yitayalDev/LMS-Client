'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, FileText, Users, UserCheck, UserX, Mail, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';

// API_URL moved to @/lib/api

interface AdminCreateUserFormProps {
    role: 'instructor' | 'admin' | 'student' | 'organization';
    onSuccess: () => void;
}

function AdminCreateUserForm({ role, onSuccess }: AdminCreateUserFormProps) {
    const { user: currentUser } = useAuth();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const payload = { ...data, role };
            if (role === 'instructor') {
                payload.instructorDetails = {
                    topic: data.topic,
                    cvUrl: data.cvUrl,
                    status: 'approved'
                };
            }

            await api.post(`/auth/admin/create-user`, payload);
            alert(`${role} account created successfully.`);
            reset();
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || `Failed to create ${role} account.`);
            console.error('Failed to create user', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
            </div>

            {role === 'instructor' && (
                <>
                    <div>
                        <Label htmlFor="topic">Expertise Topic</Label>
                        <Input id="topic" placeholder="e.g. Mathematics, Design" {...register('topic')} />
                    </div>
                    <div>
                        <Label htmlFor="cvUrl">CV Link / Portfolio</Label>
                        <Input id="cvUrl" placeholder="https://..." {...register('cvUrl')} />
                    </div>
                </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : `Create ${role}`}
            </Button>
        </form>
    );
}

function AdminEditUserForm({ user, onSuccess }: { user: any, onSuccess: () => void }) {
    const { user: currentUser } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            bio: user.bio || '',
            role: user.role
        }
    });

    const onSubmit = async (data: any) => {
        try {
            await api.patch(`/auth/admin/update-user/${user._id}`, data);
            alert('User updated successfully.');
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update user.');
            console.error('Failed to update user', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
                <Label htmlFor="edit-bio">Bio</Label>
                <Input id="edit-bio" {...register('bio')} />
            </div>
            <div>
                <Label htmlFor="edit-role">Role</Label>
                <select
                    id="edit-role"
                    {...register('role')}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="organization">Organization</option>
                </select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
        </form>
    );
}

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/auth/users`);
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, isVerified: boolean, instructorStatus?: string) => {
        try {
            await api.patch(`/auth/admin/update-status/${id}`, {
                isVerified,
                instructorStatus
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status', error);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser]);

    if (currentUser?.role !== 'admin') return <div className="p-8 text-center text-red-500">Access Denied</div>;

    const getRoleBadge = (role: string) => {
        const colors: any = {
            admin: 'bg-red-100 text-red-800 border-red-200',
            instructor: 'bg-blue-100 text-blue-800 border-blue-200',
            student: 'bg-green-100 text-green-800 border-green-200',
            organization: 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return <Badge className={`${colors[role] || 'bg-gray-100 text-gray-800'} border font-medium`}>{role.toUpperCase()}</Badge>;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <Users className="mr-3 h-8 w-8 text-primary" />
                        User Directory
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage all system users, roles, and account statuses.</p>
                </div>
                <div className="flex space-x-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Instructor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Instructor Account</DialogTitle>
                            </DialogHeader>
                            <AdminCreateUserForm role="instructor" onSuccess={() => { fetchUsers(); }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-6 py-4 font-semibold text-sm">User</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Role</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Joined</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{u.name}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center">
                                                        <Mail className="h-3 w-3 mr-1" /> {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {u.isVerified ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                                                        <UserCheck className="h-3 w-3 mr-1" /> Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 w-fit">
                                                        <UserX className="h-3 w-3 mr-1" /> Pending
                                                    </Badge>
                                                )}
                                                {u.role === 'instructor' && u.instructorDetails?.status && (
                                                    <Badge variant="outline" className={`w-fit text-[10px] ${u.instructorDetails.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        u.instructorDetails.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {u.instructorDetails.status.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {!u.isVerified && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleUpdateStatus(u._id, true, u.role === 'instructor' ? 'approved' : undefined)}
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {u.role === 'instructor' && u.instructorDetails?.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleUpdateStatus(u._id, false, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            )}
                                            <Dialog open={editingUser?._id === u._id} onOpenChange={(open) => !open && setEditingUser(null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingUser(u)}>Edit</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit User Profile</DialogTitle>
                                                    </DialogHeader>
                                                    {editingUser && <AdminEditUserForm user={editingUser} onSuccess={() => { setEditingUser(null); fetchUsers(); }} />}
                                                </DialogContent>
                                            </Dialog>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
