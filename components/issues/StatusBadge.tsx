"use client"

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
            className: 'bg-status-open-bg text-status-open border-status-open/20',
        },
        in_progress: {
            label: 'In Progress',
            icon: Loader2,
            className: 'bg-status-progress-bg text-status-progress border-status-progress/20',
        },
        resolved: {
            label: 'Resolved',
            icon: CheckCircle2,
            className: 'bg-status-resolved-bg text-status-resolved border-status-resolved/20',
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
            className: 'bg-priority-low/10 text-priority-low border-priority-low/20',
        },
        medium: {
            label: 'Medium',
            className: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
        },
        high: {
            label: 'High',
            className: 'bg-priority-high/10 text-priority-high border-priority-high/20',
        },
        critical: {
            label: 'Critical',
            className: 'bg-priority-critical/10 text-priority-critical border-priority-critical/20 animate-pulse',
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
    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
            <Clock className="h-3 w-3" />
            {getTimeAgo(date)}
        </span>
    );
}
