"use client";

import { useEffect, useState } from "react";
import api, { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Film,
    Music,
    Image as ImageIcon,
    Download,
    Eye,
    Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fullscreen, X } from "lucide-react";

interface Material {
    _id: string;
    title: string;
    description: string;
    fileType: 'video' | 'pdf' | 'audio' | 'document' | 'image' | 'other';
    fileSize: number;
    mimeType: string;
    fileName: string;
    createdAt: string;
    module?: string;
    uploadedBy: {
        name: string;
    };
}

interface StudentMaterialViewProps {
    courseId: string;
}

export default function StudentMaterialView({ courseId }: StudentMaterialViewProps) {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModule, setSelectedModule] = useState<string>("all");
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // API_URL imported from @/lib/api

    useEffect(() => {
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
        fetchMaterials();
    }, [courseId]);

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
            case "video": return <Film className="h-8 w-8 text-blue-500 mb-2" />;
            case "audio": return <Music className="h-8 w-8 text-yellow-500 mb-2" />;
            case "image": return <ImageIcon className="h-8 w-8 text-purple-500 mb-2" />;
            default: return <FileText className="h-8 w-8 text-gray-500 mb-2" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const uniqueModules = Array.from(new Set(materials.map(m => m.module || "General").filter(Boolean)));

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = selectedModule === "all" || (material.module || "General") === selectedModule;
        return matchesSearch && matchesModule;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No materials available</h3>
                <p className="text-muted-foreground">The instructor hasn't uploaded any materials yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search materials..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                    <Button
                        variant={selectedModule === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedModule("all")}
                    >
                        All
                    </Button>
                    {uniqueModules.map(module => (
                        <Button
                            key={module}
                            variant={selectedModule === module ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedModule(module)}
                        >
                            {module}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => (
                    <Card key={material._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                {getIcon(material.fileType)}
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    {material.module || "General"}
                                </span>
                            </div>
                            <CardTitle className="line-clamp-1 text-base">{material.title}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {material.description || "No description provided"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                <span>{formatFileSize(material.fileSize)}</span>
                                <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => handleDownload(material._id, material.fileName)}
                                >
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                                {material.fileType !== 'other' && (
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedMaterial(material);
                                            setIsPreviewOpen(true);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredMaterials.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No materials found matching your search.</p>
                </div>
            )}

            {/* Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/95 text-white border-none">
                    <DialogHeader className="p-4 bg-background/5 text-white border-b border-white/10 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <DialogTitle className="text-xl font-bold">{selectedMaterial?.title}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {selectedMaterial?.fileType.toUpperCase()} • {formatFileSize(selectedMaterial?.fileSize || 0)}
                                <span className="block text-[10px] mt-1 text-gray-500">
                                    Debug: type={selectedMaterial?.fileType} | mime={selectedMaterial?.mimeType} | ext={selectedMaterial?.fileName.split('.').pop()}
                                </span>
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="relative flex items-center justify-center bg-black min-h-[300px] max-h-[calc(90vh-80px)] overflow-auto">
                        {user && (selectedMaterial?.fileType === 'video' || selectedMaterial?.mimeType.startsWith('video/')) && (
                            <video
                                controls
                                autoPlay
                                className="w-full h-full max-h-[calc(90vh-100px)]"
                                controlsList="nodownload"
                            >
                                <source src={`${API_URL}/materials/stream/${selectedMaterial?._id}?token=${user.token}`} type={selectedMaterial?.mimeType || 'video/mp4'} />
                                Your browser does not support the video tag.
                            </video>
                        )}

                        {user && (selectedMaterial?.fileType === 'audio' || selectedMaterial?.mimeType.startsWith('audio/')) && (
                            <div className="flex flex-col items-center justify-center p-12 w-full">
                                <Music className="h-20 w-20 text-blue-500 mb-6 animate-pulse" />
                                <audio controls autoPlay className="w-full max-w-md">
                                    <source src={`${API_URL}/materials/stream/${selectedMaterial?._id}?token=${user.token}`} type={selectedMaterial?.mimeType} />
                                </audio>
                            </div>
                        )}

                        {user && (selectedMaterial?.fileType === 'pdf' ||
                            selectedMaterial?.mimeType === 'application/pdf' ||
                            selectedMaterial?.fileName.toLowerCase().endsWith('.pdf') ||
                            selectedMaterial?.fileType === 'document' ||
                            selectedMaterial?.fileName.toLowerCase().endsWith('.docx') ||
                            selectedMaterial?.fileName.toLowerCase().endsWith('.doc')
                        ) && (
                                <iframe
                                    src={`${API_URL}/materials/stream/${selectedMaterial?._id}?token=${user.token}#toolbar=0`}
                                    className="w-full h-[70vh] bg-white"
                                    title={selectedMaterial?.title}
                                />
                            )}

                        {user && (selectedMaterial?.fileType === 'image' || selectedMaterial?.mimeType.startsWith('image/')) && (
                            <img
                                src={`${API_URL}/materials/stream/${selectedMaterial?._id}?token=${user.token}`}
                                alt={selectedMaterial?.title}
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        )}

                        {!(selectedMaterial?.fileType === 'video' || selectedMaterial?.mimeType.startsWith('video/') ||
                            selectedMaterial?.fileType === 'audio' || selectedMaterial?.mimeType.startsWith('audio/') ||
                            selectedMaterial?.fileType === 'pdf' || selectedMaterial?.mimeType === 'application/pdf' || selectedMaterial?.fileName.toLowerCase().endsWith('.pdf') ||
                            selectedMaterial?.fileType === 'image' || selectedMaterial?.mimeType.startsWith('image/') ||
                            selectedMaterial?.fileType === 'document' ||
                            selectedMaterial?.fileName.toLowerCase().endsWith('.docx') ||
                            selectedMaterial?.fileName.toLowerCase().endsWith('.doc')) && (
                                <div className="text-center p-12">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="mb-4 text-lg text-white">Preview not available for this file type.</p>
                                    <Button onClick={() => handleDownload(selectedMaterial!._id, selectedMaterial!.fileName)}>
                                        Download to View
                                    </Button>
                                </div>
                            )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
