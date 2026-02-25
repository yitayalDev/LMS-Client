'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tag, Trash2, Plus, Percent, DollarSign, Calendar, Users, X } from 'lucide-react';

export default function AdminCouponsPage() {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        maxUses: '',
    });

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (err) {
            console.error('Failed to fetch coupons', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchCoupons();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/coupons', {
                code: form.code,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                expiryDate: form.expiryDate,
                maxUses: form.maxUses ? Number(form.maxUses) : undefined,
            });
            setShowForm(false);
            setForm({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '', maxUses: '' });
            fetchCoupons();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Delete coupon "${code}"?`)) return;
        try {
            await api.delete(`/coupons/${id}`);
            fetchCoupons();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete coupon');
        }
    };

    const isExpired = (date: string) => new Date(date) < new Date();

    if (loading) return <div className="p-8 text-center">Loading coupons...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Coupon Management</h1>
                    <p className="text-muted-foreground mt-1">Create and manage discount coupon codes for courses.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2" variant={showForm ? 'outline' : 'default'}>
                    {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Coupon</>}
                </Button>
            </div>

            {/* Inline Create Form */}
            {showForm && (
                <Card className="border-2 border-primary/30 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" /> Create New Coupon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. SUMMER50"
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="discountType">Discount Type *</Label>
                                    <select
                                        id="discountType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={form.discountType}
                                        onChange={e => setForm({ ...form, discountType: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discountValue">
                                        {form.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                                    </Label>
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        min="1"
                                        max={form.discountType === 'percentage' ? '100' : undefined}
                                        placeholder={form.discountType === 'percentage' ? '10' : '5'}
                                        value={form.discountValue}
                                        onChange={e => setForm({ ...form, discountValue: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                                    <Input
                                        id="expiryDate"
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={form.expiryDate}
                                        onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="maxUses">Max Uses (optional)</Label>
                                    <Input
                                        id="maxUses"
                                        type="number"
                                        min="1"
                                        placeholder="Unlimited"
                                        value={form.maxUses}
                                        onChange={e => setForm({ ...form, maxUses: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={submitting} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    {submitting ? 'Creating...' : 'Create Coupon'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                        <Tag className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{coupons.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Tag className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {coupons.reduce((a, c) => a + (c.currentUses || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    {coupons.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>No coupons yet. Click <strong>New Coupon</strong> to create your first one.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Code</th>
                                        <th className="px-4 py-3">Discount</th>
                                        <th className="px-4 py-3">Course</th>
                                        <th className="px-4 py-3">Uses</th>
                                        <th className="px-4 py-3">Expiry</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded text-xs">
                                                    {coupon.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-bold">
                                                <span className="flex items-center gap-1">
                                                    {coupon.discountType === 'percentage'
                                                        ? <><Percent className="h-3 w-3 text-purple-500" />{coupon.discountValue}% OFF</>
                                                        : <><DollarSign className="h-3 w-3 text-green-500" />${coupon.discountValue} OFF</>
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground text-xs">
                                                {coupon.course?.title || <span className="italic">All courses</span>}
                                            </td>
                                            <td className="px-4 py-4">
                                                {coupon.currentUses}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                                            </td>
                                            <td className="px-4 py-4 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {isExpired(coupon.expiryDate) ? (
                                                    <Badge className="bg-red-100 text-red-700">Expired</Badge>
                                                ) : coupon.isActive ? (
                                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 h-7"
                                                    onClick={() => handleDelete(coupon._id, coupon.code)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
