'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Activity,
    User as UserIcon,
    Clock,
    Filter,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function AuditLogDashboard() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        resourceType: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(filters.action && { action: filters.action }),
                ...(filters.resourceType && { resourceType: filters.resourceType })
            });
            const res = await api.get(`/audit-logs?${params}`);
            setLogs(res.data.logs);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchLogs();
        }
    }, [user, page, filters]);

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-50';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50';
        if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground mt-1">Track administrative and security-critical actions across the platform.</p>
                </div>
                <Button variant="outline" onClick={() => fetchLogs()} disabled={loading}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Filter by Action</label>
                            <Select onValueChange={(v) => setFilters({ ...filters, action: v === 'all' ? '' : v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="USER_LOGIN">User Login</SelectItem>
                                    <SelectItem value="USER_REGISTER">User Register</SelectItem>
                                    <SelectItem value="ADMIN_CREATE_USER">Admin Create User</SelectItem>
                                    <SelectItem value="ADMIN_UPDATE_USER">Admin Update User</SelectItem>
                                    <SelectItem value="COURSE_APPROVE">Course Approve</SelectItem>
                                    <SelectItem value="COURSE_REJECT">Course Reject</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Resource Type</label>
                            <Select onValueChange={(v) => setFilters({ ...filters, resourceType: v === 'all' ? '' : v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Resources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Resources</SelectItem>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Course">Course</SelectItem>
                                    <SelectItem value="Organization">Organization</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">Loading logs...</TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No logs found matching filters.</TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {log.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate" title={log.description}>
                                                {log.description}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {log.ipAddress || 'Internal'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {logs.length} of {total} entries
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={logs.length < 20}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
