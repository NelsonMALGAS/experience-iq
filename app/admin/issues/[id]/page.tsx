import { fetchCollection } from "@/app/actions"
import { IssueCollection, Role } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    AlertCircle,
    User,
    Calendar,
    Clock,
    Tag,
    CheckCircle2,
    Info
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { formatFullDate, formatRelativeTime, generateTimeline, getPriorityConfig, getStatusConfig } from "@/utils/issueDetailsUtils"
import { ImageGallery } from "@/components/issueDetails/Imagegallery"
import { Timeline } from "@/components/issueDetails/Timeline"
import { MetadataCard } from "@/components/issueDetails/MetadataCard"
import { ErrorState, NotFoundState } from "@/components/issueDetails/ErrorStates"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/db/server"
import { requireVerifiedUser } from "@/lib/verificationGuards"
import Unverified from "@/components/Unverified"


const IssueDetailsPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {
    const { id } = await params

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;

    if (!uid) redirect(`/login?role=${role || "admin"}`)

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} />
    }

    // Fetch data outside of JSX
    let issuesCol: IssueCollection[] | null = null;
    let error: Error | null = null;

    try {
        issuesCol = await fetchCollection<IssueCollection>("issues")
    } catch (e) {
        error = e instanceof Error ? e : new Error('Failed to fetch issues')
    }

    // Handle error state
    if (error) {
        return <ErrorState error={error} />
    }

    // Handle no data
    if (!issuesCol) {
        return <ErrorState error={new Error('No issues collection found')} />
    }

    // Find the issue
    const allIssues = issuesCol.flatMap(doc => doc.issues)
    const issue = allIssues.find((i) => i.id === id)

    // Handle not found
    if (!issue) {
        return <NotFoundState />
    }

    // Generate view data
    const statusConfig = getStatusConfig(issue.status)
    const priorityConfig = getPriorityConfig(issue.priority)
    const timeline = generateTimeline(issue)
    const goBackUrl = role === "admin" ? "/admin" : "/staff/issues"

    // Render success state
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl mt-24 animate-fade-in">
            {/* Back Button */}
            <Link href={goBackUrl}>
                <Button variant="ghost" size="sm" className="mb-6 hover:bg-muted">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Issues
                </Button>
            </Link>

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-4xl font-bold text-foreground mb-3 wrap-break-word">
                            {issue.title}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                                variant={statusConfig.variant}
                                className={cn("px-3 py-1 text-sm", statusConfig.className)}
                            >
                                {statusConfig.label}
                            </Badge>
                            <Badge
                                variant={priorityConfig.variant}
                                className={cn("px-3 py-1 text-sm", priorityConfig.className)}
                            >
                                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                {priorityConfig.label} Priority
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1 text-sm">
                                <Tag className="h-3.5 w-3.5 mr-1.5" />
                                {issue.category}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <User className="h-4 w-4 mr-2" />
                                Reassign Issue
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Quick Info Bar */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created {formatRelativeTime(issue.createdAt)}
                    </span>
                    {issue.updatedAt && (
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Updated {formatRelativeTime(issue.updatedAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Info className="h-5 w-5 text-muted-foreground" />
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {issue.description ? (
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                    {issue.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">
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
                <div className="space-y-6">
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
                                className: "bg-blue-100 text-blue-600",
                            },
                            {
                                label: "Room Number",
                                value: issue.roomNumber,
                                icon: "map-pin",
                                fallback: "Not specified",
                                className: "bg-purple-100 text-purple-600",
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
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-600",
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
                                className: "bg-orange-100 text-orange-600",
                            },
                            {
                                label: "Location",
                                value: issue.propertyLocation || issue.propertyName,
                                icon: "map-pin",
                                fallback: "Not specified",
                                className: "bg-yellow-100 text-yellow-600",
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
                                className: "bg-blue-100 text-blue-600",
                            },
                            {
                                label: "Last Updated",
                                value: issue.updatedAt ? formatFullDate(issue.updatedAt) : null,
                                icon: "clock",
                                fallback: "Never updated",
                                className: "bg-indigo-100 text-indigo-600",
                            },
                            {
                                label: "Resolved At",
                                value: issue.resolvedAt ? formatFullDate(issue.resolvedAt) : null,
                                icon: "check-circle",
                                fallback: issue.status === 'resolved' ? 'Recently resolved' : 'Not resolved',
                                className: issue.resolvedAt
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-600",
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}

export default IssueDetailsPage