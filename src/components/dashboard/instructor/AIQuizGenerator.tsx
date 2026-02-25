'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Loader2, Save, RotateCcw, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// API_URL moved to @/lib/api

interface GeneratedQuestion {
    questionText: string;
    options: string[];
    correctAnswer: number;
    type: string;
    points: number;
}

export default function AIQuizGenerator({ onSave }: { onSave?: (questions: GeneratedQuestion[]) => void }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!content.trim() || loading) return;

        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post(`/ai/generate-quiz`, {
                content,
                count: 5
            });

            setQuestions(data);
        } catch (error: any) {
            console.error('AI Error', error);
            setError(error.response?.data?.message || "Failed to generate questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (onSave) onSave(questions);
        // Reset or notify
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-white/10 shadow-xl overflow-hidden">
                <CardHeader className="relative">
                    <div className="absolute top-0 right-0 p-4">
                        <Sparkles className="h-12 w-12 text-blue-500/20 animate-pulse" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-400" />
                        AI Quiz Generator
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Paste your course content below and let AI create multiple-choice questions for you.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Paste course text, lecture notes, or main concepts here..."
                        className="min-h-[200px] bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        {questions.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setQuestions([]);
                                    setContent('');
                                }}
                                className="border-white/10 text-gray-400 hover:text-white"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Start Over
                            </Button>
                        )}
                        <Button
                            onClick={handleGenerate}
                            disabled={!content.trim() || loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles className="h-4 w-4 mr-2" /> Generate Questions</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {questions.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Generated Questions ({questions.length})</h3>
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500">
                            <Save className="h-4 w-4 mr-2" />
                            Add to Quiz
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {questions.map((q, idx) => (
                            <Card key={idx} className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-colors">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-white flex-1">{idx + 1}. {q.questionText}</p>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none ml-2">
                                            {q.points} pts
                                        </Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {q.options.map((opt, oIdx) => (
                                            <div
                                                key={oIdx}
                                                className={cn(
                                                    "p-2 rounded-lg text-sm border transition-all",
                                                    oIdx === q.correctAnswer
                                                        ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-sm"
                                                        : "bg-black/20 border-white/5 text-gray-400"
                                                )}
                                            >
                                                <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
