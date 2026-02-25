'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, User, Mail, Lock, GraduationCap, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { userService } from '@/services/userService';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    bio: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref');
    const { register: registerUser } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setAvatarFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true);

            // Preparation for student-only registration
            const extra: any = {
                bio: data.bio
            };

            // Register user as student (hardcoded as per requirements)
            const response = await registerUser(data.name, data.email, data.password, 'student', {
                ...extra,
                referralCode: refCode
            });

            if (avatarFile && response) {
                try {
                    await userService.uploadAvatar(avatarFile);
                } catch (avatarError) {
                    console.error('Avatar upload failed:', avatarError);
                }
            }
        } catch (error: any) {
            console.error('Registration failed', error);
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950/40 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700 relative z-10 py-8">
                <div className="text-center space-y-3">
                    <div className="mx-auto h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-xl mb-6 ring-1 ring-white/20">
                        <GraduationCap className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                        LMS<span className="text-primary italic">UOG</span>
                    </h1>
                    <p className="text-zinc-300 font-medium text-lg tracking-wide opacity-90">
                        Begin your student journey today
                    </p>
                </div>

                <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl ring-1 ring-white/10">
                    <CardHeader className="space-y-2 pt-10 px-8">
                        <CardTitle className="text-3xl text-center font-bold text-white tracking-tight">Create Account</CardTitle>
                        <p className="text-center text-sm text-zinc-300 font-medium">
                            Join our community and start learning
                        </p>
                    </CardHeader>
                    <CardContent className="pb-10 px-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center space-y-4 mb-2">
                                <div
                                    className="h-28 w-28 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all relative group shadow-inner"
                                    onClick={() => document.getElementById('avatar-input')?.click()}
                                >
                                    {avatarPreview ? (
                                        <>
                                            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="text-white h-7 w-7" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center">
                                            <User className="h-12 w-12 text-zinc-500 group-hover:text-primary transition-colors" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="avatar-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarSelect}
                                    className="hidden"
                                />
                                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                                    Upload Avatar
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 ml-1 font-medium italic">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <Input
                                            placeholder="John Doe"
                                            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all rounded-2xl h-14 text-base"
                                            {...register('name')}
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium animate-in slide-in-from-left-2">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300 ml-1 font-medium italic">Email Address</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all rounded-2xl h-14 text-base"
                                            {...register('email')}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium animate-in slide-in-from-left-2">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300 ml-1 font-medium italic">Password</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all rounded-2xl h-14 text-base"
                                            {...register('password')}
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium animate-in slide-in-from-left-2">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300 ml-1 font-medium italic">Brief Bio (Optional)</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Tell us about yourself..."
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all rounded-2xl h-14 text-base"
                                            {...register('bio')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary hover:bg-primary/90 text-white mt-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    'Creating Account...'
                                ) : (
                                    <>
                                        <UserPlus className="mr-3 h-6 w-6" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <p className="text-sm text-zinc-300 font-medium">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-primary hover:text-primary/80 font-bold transition-colors decoration-2 underline-offset-4 hover:underline"
                                >
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-zinc-500 font-medium tracking-widest uppercase opacity-70">
                    © 2026 LMSUOG Platform • Secure Registration
                </p>
            </div>
        </div>
    );
}
