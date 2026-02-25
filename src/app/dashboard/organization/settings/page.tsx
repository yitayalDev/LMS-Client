'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Shield, Webhook, Plus, X, Save } from 'lucide-react';

interface OrgSettings {
    name: string;
    primaryColor: string;
    logo: string;
    allowedIPs: string[];
    webhookUrl: string;
}

export default function OrganizationSettings() {
    const [settings, setSettings] = useState<OrgSettings>({
        name: '',
        primaryColor: '#6366F1',
        logo: '',
        allowedIPs: [],
        webhookUrl: ''
    });
    const [orgId, setOrgId] = useState('');
    const [newIP, setNewIP] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await api.get('/organizations/my-billing');
                const org = res.data?.organization;
                if (org) {
                    setSettings({
                        name: org.name || '',
                        primaryColor: org.primaryColor || '#6366F1',
                        logo: org.logo || '',
                        allowedIPs: org.allowedIPs || [],
                        webhookUrl: org.webhookUrl || ''
                    });
                    setOrgId(org._id);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await api.patch(`/organizations/${orgId}/settings`, settings);
            setMessage('Settings saved successfully!');
            // Apply theme dynamically
            document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
        } catch (e) {
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const addIP = () => {
        if (newIP && !settings.allowedIPs.includes(newIP)) {
            setSettings(prev => ({ ...prev, allowedIPs: [...prev.allowedIPs, newIP] }));
            setNewIP('');
        }
    };

    const removeIP = (ip: string) => {
        setSettings(prev => ({ ...prev, allowedIPs: prev.allowedIPs.filter(i => i !== ip) }));
    };

    if (loading) return <div className="p-8 text-white">Loading settings...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">Organization Settings</h1>

            {message && (
                <div className={`p-3 rounded-lg text-sm border ${message.includes('Failed') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {message}
                </div>
            )}

            {/* Theme Customization */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Palette className="h-5 w-5 text-purple-400" /> Theme Customization
                    </CardTitle>
                    <CardDescription>Personalize your organization's branding colors and logo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Organization Name</Label>
                            <Input
                                value={settings.name}
                                onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Logo URL</Label>
                            <Input
                                placeholder="https://your-logo.com/logo.png"
                                value={settings.logo}
                                onChange={e => setSettings(prev => ({ ...prev, logo: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Primary Color</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    className="h-10 w-14 rounded border-zinc-700 cursor-pointer bg-transparent"
                                />
                                <Input
                                    value={settings.primaryColor}
                                    onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 flex items-end">
                            <div className="w-full p-4 rounded-lg border border-zinc-700 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                                <div>
                                    <p className="text-sm font-medium text-white">Preview</p>
                                    <p className="text-xs text-zinc-400">Primary color applied to buttons and accents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* IP Whitelisting */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="h-5 w-5 text-blue-400" /> IP Whitelisting
                    </CardTitle>
                    <CardDescription>
                        Restrict access to your organization's portal to specific IP addresses or ranges. Leave empty to allow all.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. 192.168.1.100 or 10.0.0."
                            value={newIP}
                            onChange={e => setNewIP(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addIP()}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Button onClick={addIP} variant="outline" className="border-zinc-700">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {settings.allowedIPs.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No IP restrictions configured — all IPs are allowed.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {settings.allowedIPs.map(ip => (
                                <div key={ip} className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-mono">
                                    {ip}
                                    <button onClick={() => removeIP(ip)} className="ml-1 hover:text-red-400 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Webhook Configuration */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Webhook className="h-5 w-5 text-green-400" /> Outbound Webhook
                    </CardTitle>
                    <CardDescription>
                        Receive real-time notifications when users complete courses. Ideal for HRIS integrations (Workday, SAP, etc.).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Webhook URL</Label>
                        <Input
                            placeholder="https://your-hris.com/webhooks/lms"
                            value={settings.webhookUrl}
                            onChange={e => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white font-mono"
                        />
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 space-y-2">
                        <p className="text-xs text-zinc-400 font-medium">Events fired to this URL:</p>
                        <div className="grid grid-cols-2 gap-1">
                            {['course.completed', 'enrollment.created', 'compliance.expired', 'certificate.issued'].map(e => (
                                <p key={e} className="text-xs font-mono text-green-400">• {e}</p>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="px-8 bg-white text-black hover:bg-zinc-200">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
            </div>
        </div>
    );
}
