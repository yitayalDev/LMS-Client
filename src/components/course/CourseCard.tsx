'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMediaUrl } from '@/lib/utils';
import StarRating from './StarRating';

interface CourseCardProps {
    course: any;
}

const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-white/50 backdrop-blur-sm group">
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={getMediaUrl(course.thumbnail)}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">No Preview</div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm">
                    <span className="text-sm font-black text-primary">${course.price}</span>
                </div>
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em]">{course.category || 'Course'}</span>
                </div>
                <CardTitle className="text-xl mt-1 line-clamp-1 font-bold group-hover:text-primary transition-colors">{course.title}</CardTitle>
                <div className="mt-2">
                    <StarRating
                        rating={course.ratings?.average || 0}
                        count={course.ratings?.count || 0}
                        size="small"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 italic">
                    {course.subtitle || course.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {course.instructor?.name ? `By ${course.instructor.name}` : 'LMS Expert'}
                    </span>
                    <Link href={`/courses/${course.slug}`}>
                        <Button size="sm" variant="ghost" className="text-xs font-black uppercase hover:bg-primary hover:text-white transition-all">
                            View Course
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
