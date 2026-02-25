'use client';

import React from 'react';

interface ScormPlayerProps {
    scormUrl: string;
    title?: string;
    onComplete?: () => void;
}

/**
 * SCORM Player Component
 * Embeds a SCORM package via iframe and listens for completion via postMessage.
 */
export function ScormPlayer({ scormUrl, title, onComplete }: ScormPlayerProps) {
    React.useEffect(() => {
        const handler = (event: MessageEvent) => {
            // Standard SCORM 2004 / SCORM 1.2 completion signal
            if (
                event.data === 'scorm_complete' ||
                event.data?.status === 'completed' ||
                event.data?.type === 'LMSFinish'
            ) {
                if (onComplete) onComplete();
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [onComplete]);

    return (
        <div className="w-full rounded-xl overflow-hidden border border-zinc-800 bg-black">
            {title && (
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-zinc-300">{title}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600 font-bold">SCORM</span>
                </div>
            )}
            <iframe
                src={scormUrl}
                className="w-full"
                style={{ height: '600px', border: 'none' }}
                title={title || 'SCORM Content'}
                allow="fullscreen"
            />
        </div>
    );
}
