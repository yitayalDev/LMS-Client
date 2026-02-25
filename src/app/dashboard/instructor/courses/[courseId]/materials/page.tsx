"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import MaterialUploadForm from "@/components/dashboard/instructor/MaterialUploadForm";
import MaterialList from "@/components/dashboard/instructor/MaterialList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseMaterialsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const [course, setCourse] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/courses/${courseId}`);
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course:", error);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleUploadSuccess = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold">
                    {course ? `Manage Materials: ${course.title}` : "Manage Course Materials"}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Material</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MaterialUploadForm
                                courseId={courseId}
                                onUploadSuccess={handleUploadSuccess}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Materials</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MaterialList key={refreshKey} courseId={courseId} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
