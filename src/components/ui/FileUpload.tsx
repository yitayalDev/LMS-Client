'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, Loader2, FileText, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Progress component or I'll use a raw progress bar
import api from '@/lib/api';
import { toast } from 'sonner';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    courseId: string;
    accept?: string;
    label?: string;
}

export default function FileUpload({ onUploadComplete, courseId, accept = "*", label = "Upload File" }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadedUrl(null);
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId);

        try {
            const response = await api.post('/courses/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                    setProgress(percentCompleted);
                },
            });

            const { url } = response.data;
            setUploadedUrl(url);
            onUploadComplete(url);
            toast.success('File uploaded successfully');
        } catch (error: any) {
            console.error('Upload failed', error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setUploadedUrl(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />

                {!file ? (
                    <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to browse</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                {file.type.startsWith('video/') ? (
                                    <VideoIcon className="h-5 w-5 text-blue-500" />
                                ) : (
                                    <FileText className="h-5 w-5 text-orange-500" />
                                )}
                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={clearFile} disabled={uploading}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {uploading && (
                            <div className="space-y-2">
                                <Progress value={progress} className="h-2" />
                                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                            </div>
                        )}

                        {uploadedUrl && (
                            <div className="flex items-center text-xs text-green-600 font-medium mt-2">
                                <CheckCircle className="h-3 w-3 mr-1" /> Ready
                            </div>
                        )}

                        {!uploading && !uploadedUrl && (
                            <Button className="w-full mt-2" size="sm" onClick={handleUpload}>
                                Start Upload
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
