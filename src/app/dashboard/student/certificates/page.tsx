'use client';

import React, { useEffect, useState } from 'react';
import api, { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Download, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

// API_URL moved to @/lib/api

export default function StudentCertificates() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await api.get(`/certificates/my-certificates`);
                setCertificates(response.data);
            } catch (error) {
                console.error('Failed to fetch certificates', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCertificates();
    }, [user]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center">
                        <Award className="mr-3 h-8 w-8 text-primary" />
                        My Certificates
                    </h1>
                    <p className="text-muted-foreground text-sm">Your earned certificates and achievements</p>
                </div>
            </div>

            {loading ? (
                <p>Loading certificates...</p>
            ) : certificates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Award className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Complete courses and pass assessments to earn certificates
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert: any) => (
                        <Card key={cert._id} className="hover:shadow-lg transition-shadow border-2">
                            <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Award className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Certificate of Completion</CardTitle>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Issued by LMS UOG
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="font-semibold">{cert.course?.title}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <a
                                        href={`${API_URL.replace('/api', '')}/certificates/download/${cert._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full" variant="default">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
