"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Issue, IssueCategory, IssuePriority } from "@/types";
import { db } from "@/db/client";
import { arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createDefaultIssue } from "@/lib/defaultIssue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing";


const AddIssuePage = () => {
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0)

    // Load guest session
    useEffect(() => {
        const storedSession = localStorage.getItem("guestSession");

        if (!storedSession) {
            router.push("/login?role=guest");
            return;
        }

        const session = JSON.parse(storedSession);
        setIssue(createDefaultIssue(session));
    }, [router]);

    if (!issue) return null;

    const updateIssue = <K extends keyof Issue>(key: K, value: Issue[K]) => {
        setIssue((prev) =>
            prev ? { ...prev, [key]: value, updatedAt: new Date() } : prev
        );
    };

    const handleSubmit = async () => {
        if (!issue.title || !issue.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!issue.guestId) {
            toast.error("Guest session not found. Please scan QR code again.");
            return;
        }

        if (isUploading) {
            toast.error("Please wait until images finish uploading");
            return;
        }

        setIsSubmitting(true);

        try {
            const issueRef = doc(db, "issues", issue.guestId);

            const newIssue = {
                id: crypto.randomUUID(),
                title: issue.title,
                description: issue.description,
                category: issue.category,
                status: issue.status,
                priority: issue.priority,
                guestId: issue.guestId,
                guestName: issue.guestName ?? null,
                roomNumber: issue.roomNumber ?? null,
                assignedTo: null,
                assignedToName: null,
                propertyId: issue.propertyId,
                propertyName: issue.propertyName ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
                resolvedAt: null,
                isAnonymous: true,
                images: imageUrls.length ? imageUrls : [],
            };

            await setDoc(
                issueRef,
                {
                    guestId: issue.guestId,
                    issues: arrayUnion(newIssue),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            toast.success("Issue submitted successfully");
            localStorage.removeItem("guestSession");
            router.push("/guest/issues");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit issue");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex justify-center px-4 py-24">
            <Card className="w-full max-w-xl border-border shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Report an Issue</CardTitle>
                    <CardDescription>
                        Room {issue.roomNumber} · We’ll notify staff immediately
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Issue Title</Label>
                        <Input
                            value={issue.title}
                            onChange={(e) => updateIssue("title", e.target.value)}
                            placeholder="e.g. Air conditioner not working"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={issue.description}
                            onChange={(e) => updateIssue("description", e.target.value)}
                            placeholder="Please describe the issue in detail..."
                            className="min-h-28"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={issue.category}
                            onValueChange={(v) =>
                                updateIssue("category", v as IssueCategory)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "room",
                                    "food",
                                    "maintenance",
                                    "noise",
                                    "cleanliness",
                                    "amenities",
                                    "billing",
                                    "staff",
                                    "other",
                                ].map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={issue.priority}
                            onValueChange={(v) =>
                                updateIssue("priority", v as IssuePriority)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {["low", "medium", "high", "critical"].map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Images (optional)</Label>

                        <div className="border border-dashed border-border rounded-lg bg-muted/40 p-4">
                            <UploadButton
                                endpoint="imageUploader"
                                appearance={{
                                    button:
                                        "w-full h-24 bg-transparent hover:bg-muted flex flex-col items-center justify-center text-muted-foreground",
                                    allowedContent: "hidden",
                                }}
                                content={{
                                    button: (
                                        <>
                                            <span className="text-sm font-medium text-center">
                                                Click to upload images (max 3 files, total ≤ 4MB)
                                            </span>
                                            <span className="text-xs text-center">
                                                Supported formats: PNG, JPG, JPEG (optional)
                                            </span>
                                        </>

                                    ),
                                }}
                                onClientUploadComplete={(res) => {
                                    if (!res) return;
                                    const urls = res.map((f) => f.url);
                                    setImageUrls((prev) => [...prev, ...urls]);
                                    setIsUploading(false);
                                    setUploadProgress(0)
                                    toast.success("Images uploaded");
                                }}
                                onUploadError={(error: Error) => {
                                    setIsUploading(false);
                                    setUploadProgress(0)
                                    toast.error(error.message);
                                }}
                                onUploadBegin={() => setIsUploading(true)}
                                onUploadProgress={(p) => setUploadProgress(p)}

                            />
                        </div>

                        {isUploading && (
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Uploading images... {uploadProgress}%
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {imageUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {imageUrls.map((src, i) => (
                                    <div
                                        key={i}
                                        className="relative h-24 rounded-md overflow-hidden border"
                                    >
                                        <Image
                                            src={src}
                                            alt={`Uploaded image ${i + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        className="w-full disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Issue"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddIssuePage;

