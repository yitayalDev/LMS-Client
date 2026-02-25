'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Switch } from '@/components/ui/switch';
import { userService } from '@/services/userService'; // Already using centralized api client

type Tab = 'profile' | 'notifications' | 'security';

export default function StudentSettings() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');

    // Notification state
    const [notifications, setNotifications] = useState({
        courseUpdates: true,
        assignmentDeadlines: true,
        newMessages: true,
        weeklyDigest: false
    });

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Load notification preferences
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const response = await userService.getNotificationPreferences();
                setNotifications(response.preferences);
            } catch (error) {
                console.error('Failed to load preferences:', error);
            }
        };
        loadPreferences();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileSave = async () => {
        setIsLoading(true);
        try {
            const response = await userService.updateProfile({ name, bio });
            updateUser(response.user);
            showMessage('success', 'Profile updated successfully!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            const response = await userService.uploadAvatar(file);
            updateUser({ ...user, avatar: response.avatar });
            showMessage('success', 'Avatar uploaded successfully!');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to upload avatar');
        }
    };

    const handleNotificationsSave = async () => {
        setIsLoading(true);
        try {
            await userService.updateNotificationPreferences(notifications);
            showMessage('success', 'Notification preferences updated!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to update preferences');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            showMessage('error', 'Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await userService.updatePassword(currentPassword, newPassword);
            showMessage('success', 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <Settings className="mr-3 h-8 w-8 text-primary" />
                        Account Settings
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage your profile and preferences.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-2">
                    <nav className="flex flex-col space-y-1">
                        <Button
                            variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveTab('profile')}
                        >
                            <User className="mr-2 h-4 w-4" /> Profile
                        </Button>
                        <Button
                            variant={activeTab === 'notifications' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveTab('notifications')}
                        >
                            <Bell className="mr-2 h-4 w-4" /> Notifications
                        </Button>
                        <Button
                            variant={activeTab === 'security' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock className="mr-2 h-4 w-4" /> Security
                        </Button>
                    </nav>
                </div>

                <div className="md:col-span-3 space-y-6">
                    {activeTab === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <AvatarUpload
                                    currentAvatar={user?.avatar}
                                    onUpload={handleAvatarUpload}
                                    size="lg"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input value={user?.email} disabled />
                                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <Input
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <Button onClick={handleProfileSave} disabled={isLoading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b">
                                    <div>
                                        <p className="text-sm font-medium">Course Updates</p>
                                        <p className="text-xs text-muted-foreground">Receive emails about new content in enrolled courses.</p>
                                    </div>
                                    <Switch
                                        checked={notifications.courseUpdates}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, courseUpdates: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b">
                                    <div>
                                        <p className="text-sm font-medium">Assignment Deadlines</p>
                                        <p className="text-xs text-muted-foreground">Get reminders 24 hours before due dates.</p>
                                    </div>
                                    <Switch
                                        checked={notifications.assignmentDeadlines}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, assignmentDeadlines: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b">
                                    <div>
                                        <p className="text-sm font-medium">New Messages</p>
                                        <p className="text-xs text-muted-foreground">Get notified when you receive new messages.</p>
                                    </div>
                                    <Switch
                                        checked={notifications.newMessages}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, newMessages: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium">Weekly Digest</p>
                                        <p className="text-xs text-muted-foreground">Receive a weekly summary of your activity.</p>
                                    </div>
                                    <Switch
                                        checked={notifications.weeklyDigest}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                                    />
                                </div>
                                <Button onClick={handleNotificationsSave} disabled={isLoading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <Button onClick={handlePasswordChange} disabled={isLoading}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
