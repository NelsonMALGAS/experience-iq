"use client";

import { Property } from "@/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MoreHorizontal,
    MapPin,
    Calendar,
    DoorOpen,
    Hash,
    User,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PropertyDetailsPopoverProps {
    property: Property;
}

export function PropertyDetailsPopover({ property }: PropertyDetailsPopoverProps) {
    const resolutionRate =
        property.totalIssues > 0
            ? Math.round(
                ((property.totalIssues - property.openIssues) / property.totalIssues) * 100
            )
            : 0;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                                <h4 className="font-semibold text-base text-foreground">
                                    {property.name}
                                </h4>
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {property.location}
                                </p>
                            </div>
                        </div>

                        {/* Property Code */}
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1.5">
                                <Hash className="h-3 w-3" />
                                {property.code}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Property Details */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Details
                        </h5>

                        <div className="space-y-2.5">
                            {/* Owner ID */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>Owner ID</span>
                                </div>
                                <span className="font-mono text-xs text-foreground truncate max-w-35">
                                    {property.ownerId.slice(0, 8)}...
                                </span>
                            </div>

                            {/* Total Rooms */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DoorOpen className="h-4 w-4" />
                                    <span>Total Rooms</span>
                                </div>
                                <span className="font-medium text-foreground">
                                    {property.rooms?.length || 0}
                                </span>
                            </div>

                            {/* Created At */}
                            {property.createdAt && (
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created</span>
                                    </div>
                                    <span className="text-foreground text-xs">
                                        {formatDistanceToNow(new Date(property.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Statistics */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Statistics
                        </h5>

                        <div className="space-y-2.5">
                            {/* Total Issues */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Total Issues</span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    {property.totalIssues}
                                </span>
                            </div>

                            {/* Open Issues */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Open Issues</span>
                                </div>
                                <Badge
                                    variant={property.openIssues > 0 ? "destructive" : "outline"}
                                    className="font-semibold"
                                >
                                    {property.openIssues}
                                </Badge>
                            </div>

                            {/* Resolved Issues */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Resolved Issues</span>
                                </div>
                                <span className="font-semibold text-success">
                                    {property.resolvedIssues}
                                </span>
                            </div>

                            {/* Resolution Rate */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Resolution Rate</span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    {resolutionRate}%
                                </span>
                            </div>

                            {/* Avg Resolution Time */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Avg Resolution Time</span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    {property.avgResolutionTime}h
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rooms List (if available) */}
                    {property.rooms && property.rooms.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Rooms ({property.rooms.length})
                                </h5>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    <div className="flex flex-wrap gap-1.5">
                                        {property.rooms.slice(0, 20).map((room) => (
                                            <Badge
                                                key={room.id}
                                                variant="secondary"
                                                className="text-xs px-2 py-0.5"
                                            >
                                                {room.roomNumber}
                                            </Badge>
                                        ))}
                                        {property.rooms.length > 20 && (
                                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                                                +{property.rooms.length - 20} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}