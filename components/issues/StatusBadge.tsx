"use client"

import { getTimeAgo } from '@/lib/transformTimeStamp';
import { cn } from '@/lib/utils';
import { IssueStatus, IssuePriority } from '@/types';
import { Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
    status: IssueStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = {
        open: {
            label: 'Open',
            icon: AlertCircle,
            className: 'bg-blue-100 text-blue-800 border border-blue-200',
        },
        in_progress: {
            label: 'In Progress',
            icon: Loader2,
            className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        },
        resolved: {
            label: 'Resolved',
            icon: CheckCircle2,
            className: 'bg-green-100 text-green-800 border border-green-200',
        },
    };

    const { label, icon: Icon, className: statusClass } = config[status];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                statusClass,
                className
            )}
        >
            <Icon className={cn("h-3.5 w-3.5", status === 'in_progress' && "animate-spin")} />
            {label}
        </span>
    );
}

interface PriorityBadgeProps {
    priority: IssuePriority;
    className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const config = {
        low: {
            label: 'Low',
            className: 'bg-green-100 text-green-800 border border-green-200',
        },
        medium: {
            label: 'Medium',
            className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        },
        high: {
            label: 'High',
            className: 'bg-orange-100 text-orange-800 border border-orange-200',
        },
        critical: {
            label: 'Critical',
            className: 'bg-red-100 text-red-800 border border-red-200 animate-pulse',
        },
    };


    const { label, className: priorityClass } = config[priority];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border",
                priorityClass,
                className
            )}
        >
            {label}
        </span>
    );
}

interface TimeAgoBadgeProps {
    date: Date;
    className?: string;
}

export function TimeAgoBadge({ date, className }: TimeAgoBadgeProps) {


    return (
        <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
            <Clock className="h-3 w-3" />
            {getTimeAgo(date)}
        </span>
    );
}
