"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StudentMaterialView from "@/components/dashboard/student/StudentMaterialView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function StudentCourseMaterialsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const [course, setCourse] = useState<any>(null);

    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
            return;
        }

        const fetchCourse = async () => {
            try {
                const response = await api.get(`/courses/${courseId}`);
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course:", error);
            }
        };

        if (courseId && user) {
            fetchCourse();
        }
    }, [courseId, user, loading, router]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold">
                    {course ? `${course.title} - Materials` : "Course Materials"}
                </h1>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-6">
                <StudentMaterialView courseId={courseId} />
            </div>
        </div>
    );
}
