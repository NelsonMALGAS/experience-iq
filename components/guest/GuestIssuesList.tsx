'use client';

import { useState } from 'react';
import { Issue } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toDate } from '@/utils/issueDetailsUtils';



interface IssuesListProps {
    issues: Issue[];
}

export default function IssuesList({ issues }: IssuesListProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    // Filter issues
    const filteredIssues = issues.filter((issue) => {
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
        return matchesStatus && matchesPriority;
    });

    // Priority badge colors
    const getPriorityColor = (priority: Issue['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'medium':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'low':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    // Status badge colors and icons
    const getStatusConfig = (status: Issue['status']) => {
        switch (status) {
            case 'open':
                return {
                    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800',
                    icon: AlertCircle,
                };
            case 'in_progress':
                return {
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                    icon: Loader2,
                };
            case 'resolved':
                return {
                    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
                    icon: CheckCircle2,
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    icon: AlertCircle,
                };
        }
    };


    // Toggle issue expansion
    const toggleIssue = (issueId: string) => {
        setExpandedIssue(expandedIssue === issueId ? null : issueId);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Filter Issues</CardTitle>
                    <CardDescription>Narrow down your search by status and priority</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status-filter" className="text-sm font-medium">
                                Status
                            </Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="status-filter" className="w-full">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="priority-filter" className="text-sm font-medium">
                                Priority
                            </Label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger id="priority-filter" className="w-full">
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filteredIssues.length}</span>{' '}
                            of <span className="font-semibold text-foreground">{issues.length}</span> issue
                            {issues.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-semibold mb-1">No issues found</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            Try adjusting your filters to see more results
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredIssues.map((issue) => {
                        const isExpanded = expandedIssue === issue.id;
                        const statusConfig = getStatusConfig(issue.status);
                        const StatusIcon = statusConfig.icon;
                        const createdAt = toDate(issue.createdAt)
                        const updatedAt = toDate(issue.updatedAt)

                        return (
                            <Card
                                key={issue.id}
                                className={cn(
                                    'transition-all duration-200 hover:shadow-md cursor-pointer',
                                    isExpanded && 'ring-2 ring-primary/20'
                                )}
                                onClick={() => toggleIssue(issue.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <CardTitle className="text-base sm:text-lg line-clamp-2">
                                                {issue.title}
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Status Badge */}
                                                <Badge
                                                    variant="outline"
                                                    className={cn('gap-1 text-xs', statusConfig.color)}
                                                >
                                                    <StatusIcon
                                                        className={cn(
                                                            'w-3 h-3',
                                                            issue.status === 'in_progress' && 'animate-spin'
                                                        )}
                                                    />
                                                    {issue.status.charAt(0).toUpperCase() +
                                                        issue.status.slice(1).replace('-', ' ')}
                                                </Badge>

                                                {/* Priority Badge */}
                                                <Badge
                                                    variant="outline"
                                                    className={cn('text-xs', getPriorityColor(issue.priority))}
                                                >
                                                    {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                                                </Badge>

                                                {/* Category Badge */}
                                                <Badge variant="secondary" className="text-xs">
                                                    {issue.category}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Expand/Collapse Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleIssue(issue.id);
                                            }}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <CardContent className="pt-0 space-y-4">
                                        <div className="border-t pt-4">
                                            <h4 className="text-sm font-semibold mb-2">Description</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {issue.description}
                                            </p>
                                        </div>

                                        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Created Date */}
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Created
                                                </p>
                                                <p className="text-sm font-medium">{createdAt?.toLocaleDateString("en-US", {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "2-digit"
                                                })}
                                                </p>
                                            </div>

                                            {/* Updated Date */}
                                            {issue.updatedAt && (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Last Updated
                                                    </p>
                                                    <p className="text-sm font-medium">{updatedAt?.toLocaleDateString("en-US", {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "2-digit"
                                                    })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Issue ID */}
                                        <div className="border-t pt-4">
                                            <p className="text-xs text-muted-foreground mb-1">Issue ID</p>
                                            <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                                                {issue.id}
                                            </p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}