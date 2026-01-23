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


const AddIssuePage = () => {
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Generic updater
    const updateIssue = <K extends keyof Issue>(
        key: K,
        value: Issue[K]
    ) => {
        setIssue((prev) =>
            prev ? { ...prev, [key]: value, updatedAt: new Date() } : prev
        );
    };
    const handleSubmit = async () => {
        if (!issue.title || !issue.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            if (!issue.guestId) {
                toast.error("Guest session not found. Please scan QR code again.");
                return;
            }

            const issueRef = doc(db, "issues", issue.guestId);

            // 🔹 Prepare the new issue entry
            const newIssue = {
                id: crypto.randomUUID(), // unique ID per issue
                title: issue.title,
                description: issue.description,
                category: issue.category,
                status: issue.status,
                priority: issue.priority,
                guestId: issue.guestId,
                guestName: issue.guestName ?? null,
                roomNumber: issue.roomNumber ?? null,
                assignedTo: issue.assignedTo ?? null,
                assignedToName: issue.assignedToName ?? null,
                propertyId: issue.propertyId,
                propertyName: issue.propertyName ?? null,
                createdAt: new Date(),  // ← local timestamp
                updatedAt: new Date(),  // ← local timestamp
                resolvedAt: issue.resolvedAt ?? null,
                isAnonymous: true,
            };

            // 🔹 Merge with existing issues if any
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
            toast.error("Failed to submit issue. Check Firestore rules!");
        } finally {
            setIsSubmitting(false);
        }
    };




    return (
        <div className="min-h-screen bg-background flex items-start justify-center px-4 py-24">
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
                            placeholder="e.g. Air conditioner not working"
                            value={issue.title}
                            onChange={(e) => updateIssue("title", e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Please describe the issue in detail..."
                            className="min-h-30"
                            value={issue.description}
                            onChange={(e) => updateIssue("description", e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={issue.category}
                            onValueChange={(value) =>
                                updateIssue("category", value as IssueCategory)
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
                            onValueChange={(value) =>
                                updateIssue("priority", value as IssuePriority)
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

                    {/* Submit */}
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Issue"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddIssuePage;
