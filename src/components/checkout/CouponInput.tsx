'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { couponService } from '@/services/couponService';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CouponInputProps {
    courseId: string;
    onApply: (coupon: any) => void;
    onRemove: () => void;
}

export const CouponInput = ({ courseId, onApply, onRemove }: CouponInputProps) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

    const handleApply = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const data = await couponService.validate(code, courseId);
            setAppliedCoupon(data);
            onApply(data);
            toast.success(`Coupon "${data.code}" applied!`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid coupon code');
            setAppliedCoupon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCode('');
        onRemove();
        toast.info('Coupon removed');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Coupon code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon || loading}
                        className="pl-9 h-11 bg-white border-primary/10 focus:border-primary/50 uppercase font-mono tracking-widest"
                    />
                </div>
                {appliedCoupon ? (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRemove}
                        className="h-11 w-11 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleApply}
                        disabled={!code || loading}
                        className="h-11 px-6 font-bold"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                )}
            </div>

            {appliedCoupon && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-bold">
                            {appliedCoupon.discountType === 'percentage'
                                ? `${appliedCoupon.discountValue}% Off`
                                : `$${appliedCoupon.discountValue} Off`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
