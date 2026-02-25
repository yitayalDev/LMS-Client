'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.string().min(2, 'Category is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    isMandatory: z.boolean().default(false),
    recertificationDays: z.coerce.number().min(0).default(0)
});

interface FormData {
    title: string;
    description: string;
    category: string;
    price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    isMandatory: boolean;
    recertificationDays: number;
}

// API_URL moved to @/lib/api

export default function CreateCoursePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: { level: 'beginner', price: 0, isMandatory: false, recertificationDays: 0 }
    });

    const onSubmit = async (data: FormData) => {
        try {
            await api.post(`/courses`, data);
            router.push(`/dashboard/instructor`);
        } catch (error) {
            console.error('Course creation failed', error);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Course</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Course Title</label>
                            <Input placeholder="e.g. Master React in 30 Days" {...register('title')} />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                className="w-full h-32 px-3 py-2 border rounded-md text-sm border-input bg-background"
                                placeholder="Describe what students will learn..."
                                {...register('description')}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <Input placeholder="e.g. Development" {...register('category')} />
                                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Price ($)</label>
                                <Input type="number" placeholder="0" {...register('price', { valueAsNumber: true })} />
                                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Level</label>
                            <select
                                {...register('level')}
                                className="w-full h-10 px-3 py-2 border rounded-md text-sm border-input bg-background"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <h3 className="text-sm font-bold text-blue-400">Compliance & Enterprise</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isMandatory"
                                    {...register('isMandatory')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isMandatory" className="text-sm font-medium text-gray-300">
                                    Mandatory Course (for Organization)
                                </label>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Recertification Interval (Days)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 365"
                                    {...register('recertificationDays', { valueAsNumber: true })}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Set to 0 if no recertification is required after completion.</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit">Create Course</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
