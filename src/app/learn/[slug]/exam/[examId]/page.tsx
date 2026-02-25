'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// API_URL moved to @/lib/api

export default function ExamInterface() {
    const { examId, slug } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const { data } = await api.get(`/exams/${examId}`);
                setExam(data);
                setAnswers(new Array(data.questions.length).fill(-1));
            } catch (err: any) {
                setError('Failed to load exam. You might not have access.');
            } finally {
                setLoading(false);
            }
        };
        if (examId && user) fetchExam();
    }, [examId, user]);

    const handleOptionChange = (qIdx: number, optIdx: number) => {
        const newAnswers = [...answers];
        newAnswers[qIdx] = optIdx;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(-1)) {
            alert('Please answer all questions before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await api.post(`/exams/${examId}/submit`, { answers });
            setResult(data);
        } catch (err) {
            console.error('Submission failed', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading assessment...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    if (result) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className={`text-5xl font-bold ${result.status === 'passed' ? 'text-green-500' : 'text-red-500'}`}>
                            {result.percentage}%
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-xl font-medium">
                            {result.status === 'passed' ? (
                                <><CheckCircle className="text-green-500" /> <span>Passed</span></>
                            ) : (
                                <><XCircle className="text-red-500" /> <span>Not Passed</span></>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            You scored {result.score} points.
                        </p>
                        <div className="flex space-x-4 justify-center">
                            <Button variant="outline" onClick={() => router.push(`/learn/${slug}`)}>Back to Course</Button>
                            {result.status === 'passed' && (
                                <a
                                    href={`${API_URL.replace('/api', '')}/certificates/download/${result.certificateId}`}
                                    target="_blank"
                                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                                >
                                    Download Certificate
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border sticky top-20 z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">{exam.title}</h1>
                    <p className="text-sm text-muted-foreground">{exam.questions.length} Questions</p>
                </div>
                <div className="flex items-center space-x-2 font-mono text-lg bg-white px-4 py-2 border rounded shadow-inner">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{exam.timeLimit}:00</span>
                </div>
            </div>

            <div className="space-y-6">
                {exam.questions.map((question: any, qIdx: number) => (
                    <Card key={qIdx}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {qIdx + 1}. {question.questionText}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {question.options.map((option: string, optIdx: number) => (
                                <button
                                    key={optIdx}
                                    onClick={() => handleOptionChange(qIdx, optIdx)}
                                    className={`w-full p-4 text-left border rounded-lg transition-colors flex items-center justify-between ${answers[qIdx] === optIdx
                                        ? 'bg-blue-50 border-primary ring-1 ring-primary'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{option}</span>
                                    {answers[qIdx] === optIdx && <CheckCircle className="h-4 w-4 text-primary" />}
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-8">
                <Button size="lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Grading...' : 'Submit Assessment'}
                </Button>
            </div>
        </div>
    );
}
