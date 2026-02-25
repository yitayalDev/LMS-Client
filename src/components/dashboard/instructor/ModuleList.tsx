'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2, Video, FileText, HelpCircle, Clipboard, Link as LinkIcon } from 'lucide-react';

interface ModuleListProps {
    modules: any[];
    onEdit: (module: any) => void;
    onDelete: (moduleId: string) => void;
    onReorder?: (newModules: any[]) => void;
}

export default function ModuleList({ modules, onEdit, onDelete, onReorder }: ModuleListProps) {
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'document': return <FileText className="h-4 w-4" />;
            case 'quiz': return <HelpCircle className="h-4 w-4" />;
            case 'assignment': return <Clipboard className="h-4 w-4" />;
            case 'live-session': return <LinkIcon className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-4">
            {sortedModules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No modules added yet. Start by adding your first content!
                </div>
            ) : (
                sortedModules.map((module) => (
                    <Card key={module._id || module.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className={`p-2 rounded-full ${module.contentType === 'video' ? 'bg-red-100 text-red-600' :
                                        module.contentType === 'quiz' ? 'bg-blue-100 text-blue-600' :
                                            module.contentType === 'assignment' ? 'bg-green-100 text-green-600' :
                                                'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getIcon(module.contentType)}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-semibold">{module.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="capitalize">{module.contentType}</span>
                                        {module.duration > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{module.duration} mins</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(module)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(module._id || module.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
