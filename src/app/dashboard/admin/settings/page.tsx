'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Shield, Bell, Save, Globe, Database, Loader2, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/context/SettingsContext';
import { getMediaUrl } from '@/lib/utils';
import { AvatarUpload } from '@/components/ui/avatar-upload';

// API_URL moved to @/lib/api

type ActiveTab = 'general' | 'security' | 'notifications' | 'maintenance';

export default function SystemSettings() {
    const { user } = useAuth();
    const { refreshSettings } = useSettings();
    const [activeTab, setActiveTab] = useState<ActiveTab>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [settings, setSettings] = useState<any>({
        platformName: '',
        supportEmail: '',
        defaultLanguage: 'English (US)',
        allowPublicRegistration: true,
        requireInstructorApproval: true,
        maintenanceMode: false,
        authSystem: 'JWT',
        enableNotifications: true,
        platformLogo: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get(`/settings`);
                setSettings((prev: any) => ({ ...prev, ...data }));
            } catch (error) {
                console.error('Failed to fetch settings', error);
                alert('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchSettings();
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.patch(`/settings`, settings);
            setSettings((prev: any) => ({ ...prev, ...data }));
            await refreshSettings();
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        try {
            setUploadingLogo(true);
            const { data } = await api.post('/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSettings((prev: any) => ({ ...prev, platformLogo: data.platformLogo }));
            await refreshSettings();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    if (user?.role !== 'admin') return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    if (loading) return <div className="p-8 text-center flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <Settings className="mr-3 h-8 w-8 text-primary" />
                        System Settings
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Configure global platform behavior and administrative overrides.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="shadow-lg hover:shadow-xl transition-all">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-2">
                    <nav className="flex flex-col space-y-1">
                        <Button
                            variant={activeTab === 'general' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${activeTab === 'general' ? 'font-bold bg-primary/10 text-primary' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            <Globe className="mr-3 h-5 w-5" /> General
                        </Button>
                        <Button
                            variant={activeTab === 'security' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${activeTab === 'security' ? 'font-bold bg-primary/10 text-primary' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Shield className="mr-3 h-5 w-5" /> Security
                        </Button>
                        <Button
                            variant={activeTab === 'notifications' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${activeTab === 'notifications' ? 'font-bold bg-primary/10 text-primary' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <Bell className="mr-3 h-5 w-5" /> Notifications
                        </Button>
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <Button
                                variant={activeTab === 'maintenance' ? 'secondary' : 'ghost'}
                                className={`w-full justify-start ${activeTab === 'maintenance' ? 'font-bold bg-red-50 text-red-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('maintenance')}
                            >
                                <Database className="mr-3 h-5 w-5" /> Maintenance
                            </Button>
                        </div>
                    </nav>
                </div>

                <div className="md:col-span-3">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <Card className="border-none shadow-md ring-1 ring-gray-100">
                                <CardHeader>
                                    <CardTitle className="text-xl">Branding</CardTitle>
                                    <CardDescription>Customize the platform's visual identity.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center sm:items-start gap-4">
                                        <Label>Platform Logo</Label>
                                        <AvatarUpload
                                            currentAvatar={settings.platformLogo}
                                            onUpload={handleLogoUpload}
                                            size="md"
                                            label="Change Logo"
                                        />
                                        <p className="text-xs text-muted-foreground">Upload a PNG or JPG (max 5MB). Recommended size: 200x200px.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md ring-1 ring-gray-100">
                                <CardHeader>
                                    <CardTitle className="text-xl">Platform Identity</CardTitle>
                                    <CardDescription>Basic settings for your LMS platform instance.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="platformName">Platform Name</Label>
                                            <Input
                                                id="platformName"
                                                value={settings.platformName || ''}
                                                onChange={(e) => handleChange('platformName', e.target.value)}
                                                placeholder="LMS UOG"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supportEmail">Support Email</Label>
                                            <Input
                                                id="supportEmail"
                                                type="email"
                                                value={settings.supportEmail || ''}
                                                onChange={(e) => handleChange('supportEmail', e.target.value)}
                                                placeholder="support@lmsuog.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Default Language</Label>
                                        <select
                                            id="language"
                                            className="w-full h-10 px-3 bg-white border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                            value={settings.defaultLanguage || 'English (US)'}
                                            onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                                        >
                                            <option>English (US)</option>
                                            <option>Arabic</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <Card className="border-none shadow-md ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle className="text-xl">Authentication & Policies</CardTitle>
                                <CardDescription>Manage how users register and access the platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Public Registrations</Label>
                                        <p className="text-sm text-muted-foreground">Allow new users to create accounts without invitations.</p>
                                    </div>
                                    <Switch
                                        checked={!!settings.allowPublicRegistration}
                                        onCheckedChange={(val) => handleChange('allowPublicRegistration', val)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Instructor Approval Required</Label>
                                        <p className="text-sm text-muted-foreground">Manually verify all new instructor applications.</p>
                                    </div>
                                    <Switch
                                        checked={!!settings.requireInstructorApproval}
                                        onCheckedChange={(val) => handleChange('requireInstructorApproval', val)}
                                    />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Label>Primary Auth Method</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant={settings.authSystem === 'JWT' ? 'default' : 'outline'}
                                            onClick={() => handleChange('authSystem', 'JWT')}
                                            className="justify-center"
                                        >
                                            <CheckCircle2 className={`mr-2 h-4 w-4 ${settings.authSystem === 'JWT' ? 'opacity-100' : 'opacity-0'}`} />
                                            JWT Bearer
                                        </Button>
                                        <Button
                                            variant={settings.authSystem === 'Session' ? 'default' : 'outline'}
                                            onClick={() => handleChange('authSystem', 'Session')}
                                            className="justify-center"
                                            disabled
                                        >
                                            Cookie Session
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card className="border-none shadow-md ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle className="text-xl">Platform Notifications</CardTitle>
                                <CardDescription>Global notification triggers and email delivery settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Enable Global Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Master switch for all system-generated notifications.</p>
                                    </div>
                                    <Switch
                                        checked={!!settings.enableNotifications}
                                        onCheckedChange={(val) => handleChange('enableNotifications', val)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 opacity-50 cursor-not-allowed">
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Coming Soon</p>
                                    <div className="p-4 rounded-lg border border-dashed border-gray-200 text-center text-sm text-gray-400">
                                        SMTP Configuration & Webhook Integrations
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'maintenance' && (
                        <Card className="border-red-100 shadow-md ring-1 ring-red-50">
                            <CardHeader className="bg-red-50/50">
                                <CardTitle className="text-xl text-red-700">Maintenance & State</CardTitle>
                                <CardDescription className="text-red-600/70">Critical actions that affect platform availability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-red-900">Maintenance Mode</Label>
                                        <p className="text-sm text-red-700/80">Restrict platform access to and allow only administrators.</p>
                                    </div>
                                    <Switch
                                        checked={!!settings.maintenanceMode}
                                        onCheckedChange={(val) => handleChange('maintenanceMode', val)}
                                    />
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <p className="text-sm font-bold text-amber-800 flex items-center mb-1">
                                        <Database className="mr-2 h-4 w-4" /> Hard Reset Precaution
                                    </p>
                                    <p className="text-xs text-amber-700">Changing maintenance mode will immediately disconnect all active student/instructor sessions if it forces a logout.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
