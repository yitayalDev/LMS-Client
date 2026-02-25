'use client';

import React from 'react';
import { MessagingDashboard } from '@/components/messaging/MessagingDashboard';

export default function MessagesPage() {
    return (
        <div className="container mx-auto py-6 h-screen max-h-[900px]">
            <MessagingDashboard />
        </div>
    );
}
