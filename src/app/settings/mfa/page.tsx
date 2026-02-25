'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import Image from 'next/image';

type MfaStep = 'idle' | 'setup' | 'verify' | 'enabled';

export default function MFASettingsPage() {
    const [step, setStep] = useState<MfaStep>('idle');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [disableToken, setDisableToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/mfa/setup');
            setQrCode(res.data.qrCode);
            setSecret(res.data.secret);
            setStep('setup');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Setup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/mfa/verify', { token });
            setStep('enabled');
            setMessage('MFA enabled successfully!');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Invalid token');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/mfa/disable', { token: disableToken });
            setStep('idle');
            setMessage('MFA has been disabled.');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Invalid token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-7 w-7 text-primary" />
                Two-Factor Authentication
            </h1>

            {message && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{message}</div>}
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}

            {step === 'idle' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldOff className="h-5 w-5 text-zinc-400" /> MFA is Disabled</CardTitle>
                        <CardDescription>Add an extra layer of security to your account using an authenticator app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            When enabled, you'll need to enter a 6-digit code from your authenticator app (e.g., Google Authenticator, Authy) each time you log in.
                        </p>
                        <Button onClick={handleSetup} disabled={loading}>
                            <Smartphone className="mr-2 h-4 w-4" />
                            {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 'setup' && qrCode && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Scan QR Code</CardTitle>
                        <CardDescription>Open your authenticator app and scan the QR code below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center p-4 bg-white border rounded-xl">
                            <img src={qrCode} alt="MFA QR Code" width={200} height={200} />
                        </div>
                        <div className="bg-zinc-50 rounded-lg p-3 border">
                            <p className="text-xs text-zinc-500 mb-1">Can't scan? Enter this code manually:</p>
                            <code className="text-sm font-mono break-all text-zinc-700">{secret}</code>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Step 2: Enter the 6-digit code to confirm</p>
                            <Input
                                placeholder="000000"
                                maxLength={6}
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                className="text-center text-2xl tracking-[0.5em] h-14"
                            />
                            <Button onClick={handleVerify} disabled={token.length !== 6 || loading} className="w-full">
                                {loading ? 'Verifying...' : 'Verify & Enable MFA'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'enabled' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600"><ShieldCheck className="h-5 w-5" /> MFA is Active</CardTitle>
                        <CardDescription>Your account is protected with two-factor authentication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">To disable MFA, enter a code from your authenticator app to confirm.</p>
                        <Input
                            placeholder="Enter code to disable"
                            maxLength={6}
                            value={disableToken}
                            onChange={e => setDisableToken(e.target.value)}
                            className="text-center text-2xl tracking-[0.5em] h-14"
                        />
                        <Button variant="destructive" onClick={handleDisable} disabled={disableToken.length !== 6 || loading} className="w-full">
                            {loading ? 'Disabling...' : 'Disable MFA'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
