import { fetchIssueById } from "@/app/optimised-actions";
import { NotFoundState } from "../issueDetails/ErrorStates";
import { formatFullDate, formatRelativeTime, generateTimeline, getPriorityConfig, getStatusConfig } from "@/utils/issueDetailsUtils";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, Calendar, Clock, Info, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ImageGallery } from "../issueDetails/Imagegallery";
import { Timeline } from "../issueDetails/Timeline";
import { MetadataCard } from "../issueDetails/MetadataCard";
import IssueDropdownMenu from "../issues/IssueDropdownMenu";
import { Role } from "@/types";

type IssueContentProps = {
    id: string,
    uid: string
    role: Role
}

const IssueContent = async ({ id, uid, role }: IssueContentProps) => {
    const issue = await fetchIssueById(id);

    if (!issue) {
        return <NotFoundState />;
    }

    const statusConfig = getStatusConfig(issue.status);
    const priorityConfig = getPriorityConfig(issue.priority);
    const timeline = generateTimeline(issue);

    return (
        <>
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 wrap-break-word">
                            {issue.title}
                        </h1>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <Badge
                                variant={statusConfig.variant}
                                className={cn("px-2.5 py-1 text-xs sm:text-sm", statusConfig.className)}
                            >
                                {statusConfig.label}
                            </Badge>
                            <Badge
                                variant={priorityConfig.variant}
                                className={cn("px-2.5 py-1 text-xs sm:text-sm", priorityConfig.className)}
                            >
                                <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                {priorityConfig.label} Priority
                            </Badge>
                            <Badge variant="outline" className="px-2.5 py-1 text-xs sm:text-sm">
                                <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                {issue.category}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions Dropdown */}
                    <IssueDropdownMenu issue={issue} currentUserId={uid} role={role} />

                </div>

                {/* Quick Info Bar */}
                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Created {formatRelativeTime(issue.createdAt)}
                    </span>
                    {issue.updatedAt && (
                        <span className="flex items-center gap-1.5 sm:gap-2">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Updated {formatRelativeTime(issue.updatedAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {issue.description ? (
                                <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                                    {issue.description}
                                </p>
                            ) : (
                                <p className="text-sm sm:text-base text-muted-foreground italic">
                                    No description provided
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Image Gallery */}
                    {issue.images && issue.images.length > 0 && (
                        <ImageGallery images={issue.images} title="Issue Photos" />
                    )}

                    {/* Timeline */}
                    <Timeline events={timeline} />
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Guest Information */}
                    <MetadataCard
                        title="Guest Information"
                        icon="user-circle"
                        items={[
                            {
                                label: "Guest Name",
                                value: issue.guestName,
                                icon: "user",
                                fallback: "Anonymous Guest",
                                className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                            },
                            {
                                label: "Room Number",
                                value: issue.roomNumber,
                                icon: "map-pin",
                                fallback: "Not specified",
                                className: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                            },
                        ]}
                    />

                    {/* Assignment */}
                    <MetadataCard
                        title="Assignment"
                        icon="user"
                        items={[
                            {
                                label: "Assigned To",
                                value: issue.assignedToName,
                                icon: "user",
                                fallback: "Unassigned",
                                className: issue.assignedToName
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
                            },
                        ]}
                    />

                    {/* Property Details */}
                    <MetadataCard
                        title="Property Details"
                        icon="building"
                        items={[
                            {
                                label: "Property",
                                value: issue.propertyName,
                                icon: "building",
                                fallback: "Unknown Property",
                                className: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                            },
                            {
                                label: "Location",
                                value: issue.propertyLocation || issue.propertyName,
                                icon: "map-pin",
                                fallback: "Not specified",
                                className: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                            },
                        ]}
                    />

                    {/* Timestamps */}
                    <MetadataCard
                        title="Timeline"
                        icon="calendar"
                        items={[
                            {
                                label: "Created At",
                                value: formatFullDate(issue.createdAt),
                                icon: "calendar",
                                className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                            },
                            {
                                label: "Last Updated",
                                value: issue.updatedAt ? formatFullDate(issue.updatedAt) : null,
                                icon: "clock",
                                fallback: "Never updated",
                                className: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                            },
                            {
                                label: "Resolved At",
                                value: issue.resolvedAt ? formatFullDate(issue.resolvedAt) : null,
                                icon: "check-circle",
                                fallback: issue.status === 'resolved' ? 'Recently resolved' : 'Not resolved',
                                className: issue.resolvedAt
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
                            },
                        ]}
                    />
                </div>
            </div>
        </>
    );
}

export default IssueContent