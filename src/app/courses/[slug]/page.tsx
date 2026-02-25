'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PlayCircle, Lock, User, Phone, Target, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getMediaUrl } from '@/lib/utils';
import { API_URL } from '@/lib/api';
import StarRating from '@/components/course/StarRating';
import CourseReviewForm from '@/components/course/CourseReviewForm';

import { reviewService } from '@/services/interactionService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function CourseDetails() {
    const { slug } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [showEnrollForm, setShowEnrollForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        goals: '',
        experience: 'beginner'
    });


    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/courses/details/${slug}`);
                setCourse(data);

                // Fetch reviews
                const reviewsData = await reviewService.getReviews(data._id);
                setReviews(reviewsData);


            } catch (error) {
                console.error('Failed to fetch course', error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchCourse();
    }, [slug]);

    const refreshReviews = async () => {
        if (!course) return;
        try {
            const reviewsData = await reviewService.getReviews(course._id);
            setReviews(reviewsData);

            // Refetch course to get updated average rating
            const { data } = await axios.get(`${API_URL}/courses/details/${slug}`);
            setCourse(data);
        } catch (error) {
            console.error('Failed to refresh reviews', error);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowEnrollForm(false);
        await processEnrollment(formData);
    };

    const handleEnrollClick = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setShowEnrollForm(true);
    };

    const processEnrollment = async (dataForEnroll: any) => {
        if (!user) {
            alert('Please log in to enroll in this course.');
            return;
        }

        setEnrolling(true);
        try {
            if (course.price > 0) {
                // Paid course - Trigger Stripe Checkout
                console.log('Creating checkout session for course:', course._id);
                const { data } = await axios.post(`${API_URL}/payments/create-checkout-session`,
                    {
                        courseId: course._id,
                        formData: dataForEnroll,

                    },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                console.log('Checkout session created:', data);

                if (data.url) {
                    console.log('Redirecting to Stripe checkout:', data.url);
                    window.location.href = data.url;
                } else {
                    throw new Error('No checkout URL received from server');
                }
            } else {
                // Free course - Direct enrollment
                console.log('Enrolling in free course:', course._id);
                await axios.post(`${API_URL}/enrollments/enroll/${course._id}`,
                    { formData: dataForEnroll },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                router.push(`/learn/${course.slug}`);
            }
        } catch (error: any) {
            console.error('Enrollment/Payment failed:', error);
            console.error('Error response:', error.response?.data);

            let errorMessage = 'An error occurred during enrollment.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'You might already be enrolled in this course.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Please log in to enroll in this course.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Course not found.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading course...</div>;
    if (!course) return <div className="p-8 text-center">Course not found.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                    <div className="mb-4">
                        <StarRating
                            rating={course.ratings?.average || 0}
                            count={course.ratings?.count || 0}
                            size="medium"
                        />
                    </div>
                    <p className="text-lg text-gray-600">{course.description}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(course.modules || []).map((module: any, i: number) => (
                            <div key={module._id} className="border rounded-lg overflow-hidden flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        {module.contentType === 'video' ? <PlayCircle className="h-5 w-5 text-primary" /> : <CheckCircle className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Module {i + 1}: {module.title}</h4>
                                        <p className="text-xs text-muted-foreground capitalize">{module.contentType} {module.duration ? `• ${module.duration} min` : ''}</p>
                                    </div>
                                </div>
                                {module.isFreePreview ? (
                                    <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">Preview</span>
                                ) : (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                        ))}
                        {(!course.modules || course.modules.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">No modules available yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Reviews Section */}
                <div className="mt-12 pt-8 border-t">
                    <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>

                    {reviews.length === 0 ? (
                        <p className="text-gray-500">No reviews yet. Be the first to review after enrolling!</p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-white p-6 rounded-lg border">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex justify-center items-center">
                                                {review.user?.avatar ? (
                                                    <img src={getMediaUrl(review.user.avatar)} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-gray-500">{review.user?.name?.charAt(0) || 'U'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <Link href={`/profile/${review.user?._id}`} className="hover:underline">
                                                    <h4 className="font-bold">{review.user?.name || 'Unknown Student'}</h4>
                                                </Link>
                                                <p className="text-xs text-gray-500">{dayjs(review.createdAt).fromNow()}</p>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} size="small" />
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-700">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <Card className="sticky top-20">
                    <div className="aspect-video bg-gray-200">
                        {course.thumbnail && <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="object-cover w-full h-full" />}
                    </div>
                    <CardHeader>
                        <div className="text-3xl font-bold">${course.price}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full" size="lg" onClick={handleEnrollClick} disabled={enrolling}>
                            {enrolling ? (course.price > 0 ? 'Redirecting...' : 'Enrolling...') : (course.price > 0 ? 'Buy Now' : 'Enroll Now')}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            30-Day Money-Back Guarantee
                        </p>
                        <div className="space-y-2 pt-4">
                            <div className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Full lifetime access</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Access on mobile and TV</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Certificate of completion</span>
                            </div>
                        </div>


                    </CardContent>
                </Card>
            </div>

            <Dialog open={showEnrollForm} onOpenChange={setShowEnrollForm}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Enrollment Form</DialogTitle>
                        <DialogDescription>
                            Please fill out this quick form to complete your enrollment in <strong>{course.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName" className="flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" /> Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="experience" className="flex items-center">
                                    <GraduationCap className="w-4 h-4 mr-2" /> Current Level
                                </Label>
                                <select
                                    id="experience"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="goals" className="flex items-center">
                                    <Target className="w-4 h-4 mr-2" /> Learning Goals
                                </Label>
                                <Textarea
                                    id="goals"
                                    placeholder="What do you hope to achieve with this course?"
                                    className="min-h-[100px]"
                                    value={formData.goals}
                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                    required
                                />
                            </div>


                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEnrollForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {course.price > 0 ? 'Proceed to Payment' : 'Complete Enrollment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
