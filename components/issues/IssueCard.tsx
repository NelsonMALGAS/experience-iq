'use client';

import { Issue, Role, StaffMember } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, User, Lock, Image as ImageIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateIssue } from "@/app/actions";
import { toast } from "sonner";
import Image from "next/image";

interface IssueCardProps {
    issue: Issue;
    staffMembers: StaffMember[];
    currentUserId?: string;
    userRole?: Role;
}

const statusConfig = {
    open: {
        label: "Open",
        className: "bg-status-open-bg text-status-open border-status-open/20",
        dotColor: "bg-status-open",
    },
    "in_progress": {
        label: "In Progress",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
    },
    resolved: {
        label: "Resolved",
        className: "bg-status-resolved-bg text-status-resolved border-status-resolved/20",
        dotColor: "bg-status-resolved",
    },
};

const priorityConfig = {
    critical: {
        label: "Critical",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: AlertCircle,
    },
    high: {
        label: "High",
        className: "bg-orange-100 text-orange-700 border-orange-200",
        icon: AlertCircle,
    },
    medium: {
        label: "Medium",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Clock,
    },
    low: {
        label: "Low",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: Clock,
    },
};

export function IssueCard({ issue, staffMembers, currentUserId, userRole = 'staff' }: IssueCardProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(issue.status);
    const [optimisticAssignee, setOptimisticAssignee] = useState(issue.assignedTo);
    const [imageError, setImageError] = useState<Set<number>>(new Set());

    const isAdmin = userRole === 'admin';
    const isAssignedToMe = issue.assignedTo === currentUserId;
    const hasImages = issue.images && issue.images.length > 0 || 0

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
        // Only admins can assign/reassign issues
        if (!isAdmin) {
            toast.error("Only administrators can assign issues");
            return;
        }

        // Handle unassignment
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

        // Handle staff assignment
        const staff = staffMembers?.find(s => s.id === staffId);
        if (!staff) {
            console.error("Staff member not found:", staffId);
            return;
        }

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

    const currentStatus = statusConfig[optimisticStatus];
    const currentPriority = priorityConfig[issue.priority];
    const PriorityIcon = currentPriority.icon;
    const assignedStaff = staffMembers?.find(s => s.id === optimisticAssignee);

    const timeAgo = (date: string | Date) => {
        const now = new Date();
        const created = new Date(date);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const handleImageError = (index: number) => {
        setImageError(prev => new Set([...prev, index]));
    };

    return (
        <Card
            className={cn(
                "hover:shadow-lg transition-all border-l-4 overflow-hidden",
                issue.priority === 'critical' && "border-l-red-500",
                issue.priority === 'high' && "border-l-orange-500",
                issue.priority === 'medium' && "border-l-yellow-500",
                issue.priority === 'low' && "border-l-gray-400",
                isAssignedToMe && "ring-2 ring-primary/20",
                isPending && "opacity-60 pointer-events-none"
            )}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground line-clamp-2">
                                {issue.title}
                            </h4>
                            {isAssignedToMe && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0 shrink-0">
                                    Mine
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{issue.propertyName}</span>
                            {issue.roomNumber && (
                                <>
                                    <span>•</span>
                                    <span>Room {issue.roomNumber}</span>
                                </>
                            )}
                            <span>•</span>
                            <span>{timeAgo(issue.createdAt)}</span>
                            {hasImages && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
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
                        className={cn("flex items-center gap-1 px-2 py-1 shrink-0", currentPriority.className)}
                    >
                        <PriorityIcon className="h-3 w-3" />
                        <span className="text-xs font-medium">{currentPriority.label}</span>
                    </Badge>
                </div>

                {/* Images Gallery */}
                {hasImages && (
                    <div className={cn(
                        "mb-3 rounded-lg overflow-hidden",
                        issue?.images?.length === 1 && "grid grid-cols-3",
                        issue?.images?.length === 2 && "grid grid-cols-3 gap-2",
                        (issue?.images?.length || 0) >= 3 && "grid grid-cols-3 gap-2"
                    )}>
                        {issue?.images?.slice(0, 3).map((imageUrl, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "relative bg-muted rounded-md overflow-hidden group",
                                    issue?.images?.length === 1 && "aspect-square",
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
                                            className="object-cover group-hover:scale-105 w-12 h-12 transition-transform duration-200"
                                            onError={() => handleImageError(index)}
                                            unoptimized

                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                )}
                                {/* Image count badge for 3+ images */}
                                {index === 2 && (issue?.images?.length || 0) > 3 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {issue.description}
                    </p>
                )}

                {/* Controls */}
                <div className="flex items-center gap-3 pt-3 border-t">
                    {/* Status Select */}
                    <Select value={optimisticStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="h-8 w-35 text-xs">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", currentStatus.dotColor)} />
                                <SelectValue />
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

                    {/* Assignee Select - Admin Only */}
                    {isAdmin ? (
                        <Select
                            value={optimisticAssignee || "unassigned"}
                            onValueChange={handleAssigneeChange}
                        >
                            <SelectTrigger className="h-8 flex-1 text-xs">
                                <div className="flex items-center gap-2">
                                    {assignedStaff ? (
                                        <>
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: assignedStaff.color }}
                                            />
                                            <span className="truncate">{assignedStaff.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">Unassigned</span>
                                        </>
                                    )}
                                </div>
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="unassigned" className="text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        <span>Unassigned</span>
                                    </div>
                                </SelectItem>
                                {staffMembers?.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id} className="text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: staff.color }}
                                            />
                                            <span>{staff.name}</span>
                                            <span className="ml-auto text-[10px] text-muted-foreground">
                                                {staff.department}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        // Read-only assignee display for staff
                        <div className="h-8 flex-1 px-3 py-2 rounded-md border border-input bg-muted/50 flex items-center gap-2 text-xs cursor-not-allowed">
                            {assignedStaff ? (
                                <>
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: assignedStaff.color }}
                                    />
                                    <span className="truncate text-foreground">{assignedStaff.name}</span>
                                </>
                            ) : (
                                <>
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Unassigned</span>
                                </>
                            )}
                            <Lock className="h-3 w-3 text-muted-foreground ml-auto" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}