'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
    type: 'user-progress' | 'compliance';
    label?: string;
}

export function ExportButton({ type, label }: ExportButtonProps) {
    const handleExport = () => {
        // Direct download via anchor — the server streams the file
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');

        const link = document.createElement('a');
        link.href = `${apiBase}/reporting/${type}?token=${token}`;
        link.download = `${type}-report.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button onClick={handleExport} variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
            <Download className="mr-2 h-4 w-4" />
            {label || 'Export Excel'}
        </Button>
    );
}
