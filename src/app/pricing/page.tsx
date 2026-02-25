'use client';

import React from 'react';
import { Check, Shield, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: '49',
        description: 'Perfect for small teams and startups.',
        features: ['Up to 10 user seats', 'Unlimited courses', 'Basic compliance tracking', 'Standard audit logs'],
        icon: Zap,
        color: 'blue'
    },
    {
        id: 'pro',
        name: 'Professional',
        price: '199',
        description: 'For growing organizations needing scale.',
        features: ['Up to 50 user seats', 'Advanced compliance automation', 'SSO Integration', 'Priority support', 'Detailed analytics'],
        popular: true,
        icon: Shield,
        color: 'purple'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '999',
        description: 'Maximum security and control for large firms.',
        features: ['Up to 500 user seats', 'Custom domain support', 'White-labeling', 'Dedicated account manager', 'SLA guarantees'],
        icon: Building2,
        color: 'orange'
    }
];

export default function PricingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSubscribe = async (planId: string) => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        if (user.role !== 'organization' && user.role !== 'admin') {
            alert('Subscription plans are currently only available for Organization accounts.');
            return;
        }

        try {
            const response = await api.post('/billing/checkout', { planId });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Failed to initiate checkout', error);
        }
    };

    return (
        <div className="py-24 px-4 bg-zinc-950 min-h-screen">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-5xl font-extrabold text-white mb-4">Enterprise-Ready Plans</h1>
                <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                    Choose the plan that fits your organization's learning and compliance needs.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`relative bg-zinc-900 border-zinc-800 flex flex-col ${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                                Most Popular
                            </div>
                        )}
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className={`p-3 rounded-2xl bg-${plan.color}-500/10`}>
                                    <plan.icon className={`h-8 w-8 text-${plan.color}-500`} />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                            <div className="mt-4 flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                <span className="text-zinc-500">/month</span>
                            </div>
                            <p className="text-zinc-400 text-sm mt-4">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-zinc-300 text-sm">
                                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className={`w-full h-12 rounded-xl font-bold ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-transparent border border-zinc-700 hover:bg-zinc-800'}`}
                                onClick={() => handleSubscribe(plan.id)}
                            >
                                Get Started
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
