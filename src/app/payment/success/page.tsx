'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PartyPopper } from 'lucide-react';
function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseSlug = searchParams.get('course_slug');

    useEffect(() => {
        // Confetti removed to unblock build
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8">
            <Card className="max-w-md w-full text-center p-8 space-y-6">
                <div className="flex justify-center">
                    <div className="bg-green-100 p-4 rounded-full">
                        <PartyPopper className="h-12 w-12 text-green-600" />
                    </div>
                </div>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Payment Successful!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-lg">
                        Thank you for your purchase. You now have full access to the course content.
                    </p>
                    <div className="pt-4">
                        <Button
                            className="w-full h-12 text-lg"
                            onClick={() => router.push(`/learn/${courseSlug}`)}
                        >
                            Start Learning Now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-lg">Confirming payment...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
