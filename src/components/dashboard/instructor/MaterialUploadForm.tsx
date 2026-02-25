"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, FileText, Film, Music, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface MaterialUploadFormProps {
    courseId: string;
    onUploadSuccess: () => void;
}

export default function MaterialUploadForm({
    courseId,
    onUploadSuccess,
}: MaterialUploadFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [moduleName, setModuleName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!title) {
                setTitle(e.target.files[0].name.split(".")[0]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !courseId || !title) {
            alert("Please fill in all required fields"); // Fallback if toast not available
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", courseId);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("module", moduleName);
        formData.append("isPublic", "false"); // Default to false for now

        try {
            await api.post("/materials/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Material uploaded successfully");

            // Reset form
            setFile(null);
            setTitle("");
            setDescription("");
            setModuleName("");

            onUploadSuccess();
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Error uploading material");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 border p-6 rounded-lg bg-card">
            <h3 className="text-lg font-medium">Upload New Material</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="file">File</Label>
                    <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="cursor-pointer"
                    />
                    {file && <p className="text-sm text-muted-foreground">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Material title"
                        disabled={isUploading}
                        required
                    />
                </div>

                <div className="grid w-full gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the material"
                        disabled={isUploading}
                    />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="module">Module/Section (Optional)</Label>
                    <Input
                        id="module"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        placeholder="e.g., Module 1"
                        disabled={isUploading}
                    />
                </div>

                <Button type="submit" disabled={isUploading || !file}>
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Material
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
