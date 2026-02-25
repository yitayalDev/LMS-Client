'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import FileUpload from '@/components/ui/FileUpload';

interface ModuleFormProps {
    courseId: string;
    moduleId?: string;
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function ModuleForm({ courseId, moduleId, initialData, onSubmit, onCancel }: ModuleFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [contentType, setContentType] = useState<string>(initialData?.contentType || 'video');
    const [contentData, setContentData] = useState<any>(initialData?.contentData || {});
    const [duration, setDuration] = useState(initialData?.duration || 0);
    const [isFreePreview, setIsFreePreview] = useState(initialData?.isFreePreview || false);
    const [uploadMode, setUploadMode] = useState(false);

    const handleContentDataChange = (name: string, value: any) => {
        setContentData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            contentType,
            contentData,
            duration,
            isFreePreview
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Module Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction to React"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what students will learn"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="document">Document (PDF)</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="live-session">Live Session Link</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                    />
                </div>
            </div>

            <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                    <h4 className="text-sm font-semibold">Content Specific Data</h4>

                    {(contentType === 'video' || contentType === 'document') && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
                                <Label htmlFor="upload-mode" className="text-xs font-medium cursor-pointer">
                                    {uploadMode ? 'Direct Upload Active' : 'Use External URL'}
                                </Label>
                                <Switch
                                    id="upload-mode"
                                    checked={uploadMode}
                                    onCheckedChange={setUploadMode}
                                />
                            </div>

                            {uploadMode ? (
                                <FileUpload
                                    courseId={courseId}
                                    accept={contentType === 'video' ? "video/*" : ".pdf"}
                                    label={`Upload ${contentType === 'video' ? 'Video' : 'Document'}`}
                                    onUploadComplete={(url) => handleContentDataChange('url', url)}
                                />
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="text-xs">{contentType === 'video' ? 'Video URL' : 'Document URL (PDF)'}</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={contentData.url || ''}
                                        onChange={(e) => handleContentDataChange('url', e.target.value)}
                                        placeholder={contentType === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/file.pdf'}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {contentType === 'quiz' && (
                        <div className="space-y-2">
                            <Label>Quiz Details (Title)</Label>
                            <Input
                                value={contentData.title || ''}
                                onChange={(e) => handleContentDataChange('title', e.target.value)}
                                placeholder="Enter quiz title"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Detailed quiz questions will be configured separately.</p>
                        </div>
                    )}

                    {contentType === 'assignment' && (
                        <div className="space-y-2">
                            <Label>Assignment Instructions</Label>
                            <Textarea
                                value={contentData.instructions || ''}
                                onChange={(e) => handleContentDataChange('instructions', e.target.value)}
                                placeholder="Enter task instructions"
                                required
                            />
                        </div>
                    )}

                    {contentType === 'live-session' && (
                        <div className="space-y-2">
                            <Label>Meeting Link</Label>
                            <Input
                                value={contentData.link || ''}
                                onChange={(e) => handleContentDataChange('link', e.target.value)}
                                placeholder="Zoom/Google Meet link"
                                required
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {moduleId ? 'Update Module' : 'Add Module'}
                </Button>
            </div>
        </form>
    );
}
