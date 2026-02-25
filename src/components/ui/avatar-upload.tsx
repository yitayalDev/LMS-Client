'use client';

import React, { useRef, useState } from 'react';
import { Upload, User, Loader2 } from 'lucide-react';
import { Button } from './button';
import { getMediaUrl } from '@/lib/utils';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUpload: (file: File) => Promise<void>;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

export function AvatarUpload({ currentAvatar, onUpload, size = 'md', label = 'Change Avatar' }: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialPreview = getMediaUrl(currentAvatar) || null;

    const [preview, setPreview] = useState<string | null>(initialPreview);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync preview when currentAvatar changes from parent
    React.useEffect(() => {
        setPreview(getMediaUrl(currentAvatar) || null);
    }, [currentAvatar]);

    const sizeClasses = {
        sm: 'h-16 w-16',
        md: 'h-24 w-24',
        lg: 'h-32 w-32'
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        try {
            setIsUploading(true);
            await onUpload(file);
        } catch (err: any) {
            setError(err.message || 'Failed to upload avatar');
            setPreview(getMediaUrl(currentAvatar) || null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center space-y-3">
            <div
                className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative group`}
                onClick={handleClick}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={() => {
                                console.error("Avatar failed to load:", preview);
                                setError("Failed to load image");
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <Upload className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6" />
                        </div>
                    </>
                ) : (
                    <User className="h-12 w-12 text-gray-400" />
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
            >
                {isUploading ? 'Uploading...' : label}
            </Button>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
