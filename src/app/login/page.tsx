'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, LogIn, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password is required')
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Login successful!', {
                description: 'Welcome back to LMSUOG.'
            });
            setTimeout(() => router.push('/dashboard'), 1000);
        } catch (error: any) {
            console.error('Login failed', error);
            toast.error('Login failed', {
                description: error.response?.data?.message || 'Invalid email or password.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950/40 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
                <div className="text-center space-y-3">
                    <div className="mx-auto h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-xl mb-6 ring-1 ring-white/20">
                        <GraduationCap className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                        LMS<span className="text-primary italic">UOG</span>
                    </h1>
                    <p className="text-zinc-300 font-medium text-lg tracking-wide opacity-90">
                        Empowering your academic journey
                    </p>
                </div>

                <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl ring-1 ring-white/10">
                    <CardHeader className="space-y-2 pt-10 px-8">
                        <CardTitle className="text-3xl text-center font-bold text-white tracking-tight">Welcome Back</CardTitle>
                        <p className="text-center text-sm text-zinc-300 font-medium">
                            Enter your credentials to access your dashboard
                        </p>
                    </CardHeader>
                    <CardContent className="pb-10 px-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all rounded-2xl h-14 text-base"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium animate-in slide-in-from-left-2">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-400">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all rounded-2xl h-14 text-base"
                                        {...register('password')}
                                    />
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium animate-in slide-in-from-left-2">{errors.password.message}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary hover:bg-primary/90 text-white"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : (
                                    <>
                                        <LogIn className="mr-3 h-6 w-6" />
                                        Sign In
                                    </>
                                )}
                            </Button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-950 px-2 text-zinc-500 font-medium tracking-wider">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/sso/google`}
                                className="w-full h-14 rounded-2xl text-base font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                            >
                                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <p className="text-sm text-zinc-300 font-medium">
                                Don't have an account?{' '}
                                <Link
                                    href="/register"
                                    className="text-primary hover:text-primary/80 font-bold transition-colors decoration-2 underline-offset-4 hover:underline"
                                >
                                    Sign Up for Free
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-zinc-500 font-medium tracking-widest uppercase opacity-70">
                    © 2026 LMSUOG Platform • Secure Access
                </p>
            </div>
        </div>
    );
}
