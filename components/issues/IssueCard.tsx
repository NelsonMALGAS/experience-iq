'use client';

import { Issue, Role, StaffMember } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Image as ImageIcon, ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateIssue } from "@/app/actions";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { priorityConfig, statusConfig } from "@/constants";
import { formatRelativeTime } from "@/utils/issueDetailsUtils";

interface IssueCardProps {
    issue: Issue;
    staffMembers: StaffMember[];
    currentUserId?: string;
    userRole?: Role;
}


export function IssueCard({ issue, staffMembers, currentUserId, userRole = 'staff' }: IssueCardProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(issue.status);
    const [optimisticAssignee, setOptimisticAssignee] = useState(issue.assignedTo);
    const [imageError, setImageError] = useState<Set<number>>(new Set());

    const isAdmin = userRole === 'admin';
    const isAssignedToMe = issue.assignedTo === currentUserId;
    const hasImages = issue.images && issue.images.length > 0;

    const handleStatusChange = (newStatus: Issue['status']) => {
        setOptimisticStatus(newStatus);
        startTransition(async () => {
            const result = await updateIssue(issue.id, issue.propertyId, { status: newStatus });
            if (!result?.success) {
                setOptimisticStatus(issue.status);
                toast.error(`Failed to update status: ${result?.message}`);
            } else {
                toast.success(`Status updated to ${statusConfig[newStatus].label}`);
            }
        });
    };

    const handleAssigneeChange = (staffId: string) => {
        if (!isAdmin) {
            toast.error("Only administrators can assign issues");
            return;
        }

        if (staffId === "unassigned") {
            setOptimisticAssignee(undefined);
            startTransition(async () => {
                const result = await updateIssue(issue.id, issue.propertyId, {
                    assignedTo: "",
                    assignedToName: "",
                });
                if (!result?.success) {
                    setOptimisticAssignee(issue.assignedTo);
                    toast.error(`Failed to unassign: ${result?.message}`);
                } else {
                    toast.success("Issue unassigned");
                }
            });
            return;
        }

        const staff = staffMembers?.find(s => s.id === staffId);
        if (!staff) return;

        setOptimisticAssignee(staffId);

        startTransition(async () => {
            const result = await updateIssue(issue.id, issue.propertyId, {
                assignedTo: staffId,
                assignedToName: staff.name,
            });
            if (!result?.success) {
                setOptimisticAssignee(issue.assignedTo);
                toast.error(`Failed to assign: ${result?.message}`);
            } else {
                toast.success(`Successfully assigned to ${staff.name}`);
            }
        });
    };

    const currentPriority = priorityConfig[issue.priority];
    const PriorityIcon = currentPriority.icon;
    const assignedStaff = staffMembers?.find(s => s.id === optimisticAssignee);



    const handleImageError = (index: number) => {
        setImageError(prev => new Set([...prev, index]));
    };


    return (
        <Card
            className={cn(
                "hover:shadow-lg transition-all duration-300 border-l-4 overflow-hidden h-full flex flex-col",
                issue.priority === 'critical' && "border-l-red-500",
                issue.priority === 'high' && "border-l-orange-500",
                issue.priority === 'medium' && "border-l-yellow-500",
                issue.priority === 'low' && "border-l-gray-400",
                isAssignedToMe && "ring-2 ring-primary/20",
                isPending && "opacity-60 pointer-events-none"
            )}
        >
            <CardContent className="p-4 sm:p-5 flex flex-col flex-1 gap-4">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Title & Mine Badge */}
                        <div className="flex items-start gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 leading-tight">
                                {issue.title}
                            </h4>
                            {isAssignedToMe && (
                                <Badge
                                    variant="outline"
                                    className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0.5 shrink-0 h-fit"
                                >
                                    Mine
                                </Badge>
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-medium">{issue.propertyName}</span>
                            {issue.roomNumber && (
                                <>
                                    <span className="hidden xs:inline">•</span>
                                    <span className="truncate">Room {issue.roomNumber}</span>
                                </>
                            )}
                            <span className="hidden xs:inline">•</span>
                            <span className="shrink-0">{formatRelativeTime(issue.createdAt)}</span>
                            {hasImages && (
                                <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1 shrink-0">
                                        <ImageIcon className="h-3 w-3" />
                                        {issue?.images?.length}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Priority Badge */}
                    <Badge
                        variant="outline"
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 shrink-0 h-fit",
                            currentPriority.className
                        )}
                    >
                        <PriorityIcon className="h-3 w-3" />
                        <span className="hidden sm:inline text-xs font-medium">{currentPriority.label}</span>
                    </Badge>
                </div>

                {/* Images Gallery - Optimized for all screen sizes */}
                {hasImages && (
                    <div className={cn(
                        "rounded-lg overflow-hidden",
                        issue?.images?.length === 1 && "grid grid-cols-1",
                        issue?.images?.length === 2 && "grid grid-cols-2 gap-2",
                        (issue?.images?.length || 0) >= 3 && "grid grid-cols-3 gap-2"
                    )}>
                        {issue?.images?.slice(0, 3).map((imageUrl, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "relative bg-muted rounded-md overflow-hidden group",
                                    issue?.images?.length === 1 && "aspect-video sm:aspect-16/10",
                                    issue?.images?.length === 2 && "aspect-square",
                                    (issue?.images?.length || 0) >= 3 && "aspect-square"
                                )}
                            >
                                {!imageError.has(index) ? (
                                    <>
                                        <Image
                                            src={imageUrl}
                                            alt={`Issue image ${index + 1}`}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={() => handleImageError(index)}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                )}
                                {/* Image count badge */}
                                {index === 2 && (issue?.images?.length || 0) > 3 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-semibold text-base sm:text-lg">
                                            +{(issue?.images?.length || 0) - 3}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                {issue.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {issue.description}
                    </p>
                )}

                {/* Controls Section - Responsive Layout */}
                <div className="flex flex-col gap-3 pt-3 border-t mt-auto">
                    {/* Status & Assignee Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        {/* Status Select */}
                        <div className="shrink-0 w-full sm:w-auto">
                            <Select value={optimisticStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-9 w-full sm:w-32 text-xs">
                                    <div className="flex items-center gap-2">
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statusConfig).map(([value, config]) => (
                                        <SelectItem key={value} value={value} className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                                                <span>{config.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignee Select - Admin Only */}
                        <div className="flex-1 min-w-0">
                            {isAdmin ? (
                                <Select
                                    value={optimisticAssignee || "unassigned"}
                                    onValueChange={handleAssigneeChange}
                                >
                                    <SelectTrigger className="h-9 w-full text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {assignedStaff ? (
                                                <>
                                                    <div
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: assignedStaff.color }}
                                                    />
                                                    <span className="truncate">{assignedStaff.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="text-muted-foreground">Unassigned</span>
                                                </>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-w-70">
                                        <SelectItem value="unassigned" className="text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                <span>Unassigned</span>
                                            </div>
                                        </SelectItem>
                                        {staffMembers?.map((staff) => (
                                            <SelectItem key={staff.id} value={staff.id} className="text-xs">
                                                <div className="flex items-center gap-2 justify-between w-full">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <div
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: staff.color }}
                                                        />
                                                        <span className="truncate">{staff.name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                        {staff.department}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="h-9 px-3 py-2 rounded-md border border-input bg-muted/50 flex items-center gap-2 text-xs cursor-not-allowed">
                                    {assignedStaff ? (
                                        <>
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: assignedStaff.color }}
                                            />
                                            <span className="truncate text-foreground flex-1">{assignedStaff.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="text-muted-foreground flex-1">Unassigned</span>
                                        </>
                                    )}
                                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View Details Button - Full Width on Mobile */}
                    <Link href={`/${userRole}/issues/${issue.id}`} className="w-full">
                        <Button
                            variant="default"
                            className="w-full h-9 text-xs sm:text-sm group"
                        >
                            <span>View Details</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}