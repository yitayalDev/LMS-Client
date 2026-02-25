"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Film,
    Music,
    Image as ImageIcon,
    MoreVertical,
    Trash2,
    Download,
    Eye
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBytes } from "@/lib/utils"; // Assuming utils exist, or I'll implement a helper

interface Material {
    _id: string;
    title: string;
    description: string;
    fileType: 'video' | 'pdf' | 'audio' | 'document' | 'image' | 'other';
    fileSize: number;
    fileName: string;
    createdAt: string;
    module?: string;
    status: string;
    uploadedBy: {
        _id: string;
        name: string;
    };
}

interface MaterialListProps {
    courseId: string;
}

export default function MaterialList({ courseId }: MaterialListProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMaterials = async () => {
        try {
            const response = await api.get(`/materials/course/${courseId}`);
            setMaterials(response.data.materials);
        } catch (error) {
            console.error("Error fetching materials:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;

        try {
            await api.delete(`/materials/${id}`);
            setMaterials(materials.filter((m) => m._id !== id));
        } catch (error) {
            console.error("Error deleting material:", error);
            alert("Failed to delete material");
        }
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            const response = await api.get(`/materials/download/${id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download material");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "video": return <Film className="h-5 w-5 text-blue-500" />;
            case "audio": return <Music className="h-5 w-5 text-yellow-500" />;
            case "image": return <ImageIcon className="h-5 w-5 text-purple-500" />;
            default: return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };



    if (loading) {
        return <div className="text-center py-4">Loading materials...</div>;
    }

    if (materials.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No materials uploaded yet.</div>;
    }

    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Title</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Module</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Size</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {materials.map((material) => (
                            <tr key={material._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle">{getIcon(material.fileType)}</td>
                                <td className="p-4 align-middle font-medium">
                                    <div className="flex flex-col">
                                        <span>{material.title}</span>
                                        {material.description && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{material.description}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 align-middle">{material.module || "-"}</td>
                                <td className="p-4 align-middle">{formatBytes(material.fileSize)}</td>
                                <td className="p-4 align-middle">{new Date(material.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 align-middle text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleDownload(material._id, material.fileName)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(material._id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
