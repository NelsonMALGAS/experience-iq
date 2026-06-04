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
import { ISSUE_CATEGORY_LABELS, STAFF_DEPARTMENTS } from "@/constants";
import { LogOut } from "lucide-react";
import useGuestSession from "@/hooks/useGuestSession";

const AddIssuePage = () => {
    const router = useRouter();
    // ── Session guard: redirects to /login?role=guest if invalid/expired ──
    const { session, loading, clearSession } = useGuestSession(true);

    const [issue, setIssue] = useState<Issue | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Build the issue once we have a valid session
    useEffect(() => {
        if (loading || !session) return;

        // Convert GuestSession → the shape createDefaultIssue expects
        const legacyShape = {
            uid: session.uid,
            role: session.role,
            propertyId: session.propertyId,
            propertyName: session.propertyName,
            propertyLocation: session.propertyLocation,
            roomId: session.roomId,
            roomNumber: session.roomNumber,
        };

        setIssue(createDefaultIssue(legacyShape));
    }, [loading, session]);

    if (loading || !issue) return null;

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
                propertyLocation: issue.propertyLocation ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
                resolvedAt: null,
                isAnonymous: true,
                images: imageUrls.length ? imageUrls : [],
                read: issue.read ?? false,
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
            // Navigate to dashboard – session is preserved for the next visit
            router.push("/guest");
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
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">Report an Issue</CardTitle>
                            <CardDescription>
                                Room {issue.roomNumber} · We&apos;ll notify staff immediately
                            </CardDescription>
                        </div>
                        {/* Change Room / logout button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive gap-1.5 shrink-0"
                            onClick={() => clearSession({ signOut: true })}
                            title="Change room or log out"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Change Room</span>
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Guest Name (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="guestName">
                            Guest Name{" "}
                            <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            id="guestName"
                            value={issue.guestName}
                            onChange={(e) => updateIssue("guestName", e.target.value)}
                            placeholder="e.g. John Smith"
                        />
                        <p className="text-sm text-muted-foreground">
                            You may leave this as Anonymous Guest if you prefer to remain anonymous.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Issue Title</Label>
                        <Input
                            value={issue.title}
                            onChange={(e) => updateIssue("title", e.target.value)}
                            placeholder="e.g. Air conditioner not working"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={issue.description}
                            onChange={(e) => updateIssue("description", e.target.value)}
                            placeholder="Please describe the issue in detail..."
                            className="min-h-28"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={issue.category}
                            onValueChange={(v) => updateIssue("category", v as IssueCategory)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {STAFF_DEPARTMENTS.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {ISSUE_CATEGORY_LABELS[cat]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={issue.priority}
                            onValueChange={(v) => updateIssue("priority", v as IssuePriority)}
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
                                    setUploadProgress(0);
                                    toast.success("Images uploaded");
                                }}
                                onUploadError={(error: Error) => {
                                    setIsUploading(false);
                                    setUploadProgress(0);
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
                                    />
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
                                            unoptimized
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