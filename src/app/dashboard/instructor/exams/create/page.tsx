'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, CheckCircle2, Brain, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AIQuizGenerator from '@/components/dashboard/instructor/AIQuizGenerator';

const questionSchema = z.object({
    questionText: z.string().min(5, 'Question text is required'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options required'),
    correctAnswer: z.number().min(0),
    points: z.number().min(1)
});

const examSchema = z.object({
    title: z.string().min(5, 'Title is required'),
    description: z.string().optional(),
    timeLimit: z.number().min(1),
    passingScore: z.number().min(1).max(100),
    questions: z.array(questionSchema).min(1, 'At least one question is required')
});

type ExamForm = z.infer<typeof examSchema>;

// API_URL moved to @/lib/api

function CreateExamContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const { register, control, handleSubmit, formState: { errors } } = useForm<ExamForm>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            title: '',
            timeLimit: 60,
            passingScore: 70,
            questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions'
    });

    const onSubmit = async (data: ExamForm) => {
        try {
            await api.post(`/exams`, { ...data, course: courseId });
            router.push(`/dashboard/instructor`);
        } catch (error) {
            console.error('Failed to create exam', error);
        }
    };

    const handleAIGenerated = (newQuestions: any[]) => {
        newQuestions.forEach(q => {
            append({
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points || 1
            });
        });
        setIsGeneratorOpen(false);
    };

    if (!courseId) return <div className="p-8">Course ID is required to create an exam.</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Create Assessment</h1>
                    <p className="text-gray-400 text-sm">Design quizzes and exams to test student knowledge.</p>
                </div>

                <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
                            <Brain className="h-4 w-4 mr-2" />
                            Generate with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl bg-[#0f172a] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-400" />
                                AI Content Assistant
                            </DialogTitle>
                        </DialogHeader>
                        <AIQuizGenerator onSave={handleAIGenerated} />
                    </DialogContent>
                </Dialog>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card className="bg-white/5 border-white/10 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Exam Basics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Exam Title</label>
                            <Input
                                {...register('title')}
                                placeholder="e.g., Introduction to Neural Networks - Midterm"
                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-600"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Time Limit (minutes)</label>
                                <Input
                                    type="number"
                                    {...register('timeLimit', { valueAsNumber: true })}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Passing Score (%)</label>
                                <Input
                                    type="number"
                                    {...register('passingScore', { valueAsNumber: true })}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Questions</h2>
                        <span className="text-sm text-gray-500">{fields.length} total questions</span>
                    </div>

                    {fields.map((field, qIdx) => (
                        <Card key={field.id} className="bg-white/5 border-white/10 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between bg-white/[0.02] border-b border-white/5 py-3 px-6">
                                <CardTitle className="text-md font-medium text-gray-300">Question {qIdx + 1}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => remove(qIdx)} className="hover:bg-red-500/10 text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Question Text</label>
                                    <Input
                                        {...register(`questions.${qIdx}.questionText`)}
                                        placeholder="What is the result of...?"
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                    {errors.questions?.[qIdx]?.questionText && (
                                        <p className="text-red-500 text-xs">{errors.questions[qIdx]?.questionText?.message}</p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Options & Correct Answer</label>
                                    <div className="grid gap-3">
                                        {[0, 1, 2, 3].map((optIdx) => (
                                            <div key={optIdx} className="flex items-center space-x-3 group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        value={optIdx}
                                                        {...register(`questions.${qIdx}.correctAnswer`, { valueAsNumber: true })}
                                                        className="peer appearance-none h-5 w-5 rounded-full border border-white/20 checked:border-blue-500 checked:bg-blue-500 cursor-pointer transition-all"
                                                    />
                                                    <CheckCircle2 className="h-3 w-3 text-white absolute hidden peer-checked:block pointer-events-none" />
                                                </div>
                                                <Input
                                                    {...register(`questions.${qIdx}.options.${optIdx}`)}
                                                    placeholder={`Option ${optIdx + 1}`}
                                                    className="bg-black/20 border-white/10 text-white group-hover:border-white/20 transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 py-8"
                        onClick={() => append({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Question Manually
                    </Button>
                </div>

                <div className="flex justify-end pt-8 border-t border-white/10">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-10">
                        Create Final Assessment
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function CreateExamPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-white">Loading exam editor...</div>}>
            <CreateExamContent />
        </Suspense>
    );
}

