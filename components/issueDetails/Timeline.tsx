'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle,
    Plus,
    UserCheck,
    Play,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFullDate, formatRelativeTime, TimelineEvent } from "@/utils/issueDetailsUtils";

interface TimelineProps {
    events: TimelineEvent[];
}

const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
        case 'created':
            return Plus;
        case 'assigned':
            return UserCheck;
        case 'status_change':
            return Play;
        case 'resolved':
            return CheckCircle;
        default:
            return Clock;
    }
};

const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
        case 'created':
            return 'text-blue-600 bg-blue-100';
        case 'assigned':
            return 'text-purple-600 bg-purple-100';
        case 'status_change':
            return 'text-orange-600 bg-orange-100';
        case 'resolved':
            return 'text-green-600 bg-green-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
};

export function Timeline({ events }: TimelineProps) {
    if (events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No activity recorded yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-6">
                    {/* Timeline line */}
                    <div className="absolute left-4.75 top-2 bottom-2 w-0.5 bg-border" />

                    {events.map((event) => {
                        const Icon = getEventIcon(event.type);
                        // const isLast = index === events.length - 1;

                        return (
                            <div key={event.id} className="relative flex gap-4 group">
                                {/* Icon */}
                                <div className={cn(
                                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background",
                                    getEventColor(event.type)
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-foreground">
                                                {event.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {event.description}
                                            </p>
                                        </div>
                                        <time
                                            className="text-xs text-muted-foreground whitespace-nowrap"
                                            title={formatFullDate(event.timestamp)}
                                        >
                                            {formatRelativeTime(event.timestamp)}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}