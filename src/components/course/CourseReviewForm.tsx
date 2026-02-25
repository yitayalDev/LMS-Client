import React, { useState } from 'react';
import StarRating from './StarRating';
import { reviewService } from '../../services/interactionService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
    courseId: string;
    onReviewSubmit: () => void;
}

const CourseReviewForm: React.FC<ReviewFormProps> = ({ courseId, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a star rating');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await reviewService.addReview(courseId, { rating, comment });
            setRating(0);
            setComment('');
            onReviewSubmit(); // Trigger refresh of reviews list
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit review. You must be enrolled to review a course.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg border mb-8">
            <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <StarRating
                        rating={rating}
                        size="large"
                        readonly={false}
                        onChange={setRating}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Written Review (Optional)</label>
                    <Textarea
                        placeholder="What did you think of this course?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <Button type="submit" disabled={submitting || rating === 0}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </form>
        </div>
    );
};

export default CourseReviewForm;
