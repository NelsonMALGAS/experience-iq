'use client';

import { useState } from 'react';
import { Issue } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Clock,
    AlertCircle,
    ChevronDown,
    Filter,
    Search,
    Calendar,
    Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toDate } from '@/utils/issueDetailsUtils';
import { getPriorityConfig, getStatusConfig } from '@/lib/optimise-helpers';

interface IssuesListProps {
    issues: Issue[];
}

type PriorityFilter = "all" | "low" | "medium" | "high" | "critical";

export default function IssuesList({ issues }: IssuesListProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    // Filter issues
    const filteredIssues = issues.filter((issue) => {
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
        return matchesStatus && matchesPriority;
    });



    // Toggle issue expansion
    const toggleIssue = (issueId: string) => {
        setExpandedIssue(expandedIssue === issueId ? null : issueId);
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Filters Section */}
            <div className="rounded-xl border border-border/60 bg-linear-to-br from-muted/30 via-background to-muted/20 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-muted/40 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <Filter className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Filter Issues</h3>
                            <p className="text-xs text-muted-foreground">Refine your view</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2.5">
                            <Label htmlFor="status-filter" className="text-sm font-medium flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary/40 rounded-full" />
                                Status
                            </Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger
                                    id="status-filter"
                                    className="w-full h-11 border-border/60 bg-background/50 hover:border-primary/40 transition-colors"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2.5">
                            <Label htmlFor="priority-filter" className="text-sm font-medium flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary/40 rounded-full" />
                                Priority
                            </Label>
                            <Select
                                value={priorityFilter}
                                onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
                            >
                                <SelectTrigger
                                    id="priority-filter"
                                    className="w-full h-11 border-border/60 bg-background/50 hover:border-primary/40 transition-colors"
                                >
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Enhanced Results count */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10">
                                <Search className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{filteredIssues.length}</span>
                                {' '}of{' '}
                                <span className="font-semibold text-foreground">{issues.length}</span>
                                {' '}{issues.length === 1 ? 'issue' : 'issues'}
                            </p>
                        </div>
                        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                }}
                                className="h-8 text-xs"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
                <Card className="border-dashed border-2 border-muted-foreground/20 bg-linear-to-br from-muted/20 to-background">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="relative mb-5">
                            <div className="absolute inset-0 bg-linear-to-br from-muted/50 to-muted/20 rounded-full blur-2xl scale-150" />
                            <div className="relative p-5 rounded-2xl bg-linear-to-br from-muted/60 to-muted/30 border border-border/50">
                                <AlertCircle className="w-10 h-10 text-muted-foreground/70" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">No matching issues</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                            Try adjusting your filters to see more results
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setStatusFilter('all');
                                setPriorityFilter('all');
                            }}
                            className="mt-5"
                        >
                            Reset filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredIssues.map((issue, index) => {
                        const isExpanded = expandedIssue === issue.id;
                        const statusConfig = getStatusConfig(issue.status);
                        const priorityConfig = getPriorityConfig(issue.priority);
                        const StatusIcon = statusConfig.icon;
                        const createdAt = toDate(issue.createdAt);
                        const updatedAt = toDate(issue.updatedAt);

                        return (
                            <div
                                key={issue.id}
                                className="group animate-in fade-in slide-in-from-bottom-4 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Card
                                    className={cn(
                                        'relative overflow-hidden transition-all duration-300 cursor-pointer border-border/60',
                                        'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
                                        'dark:hover:shadow-primary/10',
                                        isExpanded && 'ring-2 ring-primary/20 shadow-lg border-primary/40'
                                    )}
                                    onClick={() => toggleIssue(issue.id)}
                                >
                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 bg-linear-to-br from-background via-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    {/* Status indicator line */}
                                    <div
                                        className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
                                            issue.status === 'open' && "bg-linear-to-b from-slate-400 to-slate-600",
                                            issue.status === 'in_progress' && "bg-linear-to-b from-blue-400 to-blue-600",
                                            issue.status === 'resolved' && "bg-linear-to-b from-green-400 to-green-600",
                                            isExpanded && "w-1.5"
                                        )}
                                    />

                                    <CardHeader className="relative pb-4 pl-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0 space-y-3">
                                                {/* Title with gradient on hover */}
                                                <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                                    {issue.title}
                                                </CardTitle>

                                                {/* Enhanced Badges */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Status Badge */}
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'gap-1.5 text-xs font-medium px-3 py-1 transition-all duration-200',
                                                            statusConfig.color,
                                                            'hover:scale-105'
                                                        )}
                                                    >
                                                        <StatusIcon
                                                            className={cn(
                                                                'w-3 h-3',
                                                                issue.status === 'in_progress' && 'animate-spin'
                                                            )}
                                                        />
                                                        {statusConfig.label}
                                                    </Badge>

                                                    {/* Priority Badge */}
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-xs font-medium px-3 py-1 gap-1.5 transition-all duration-200',
                                                            priorityConfig.color,
                                                            'hover:scale-105'
                                                        )}
                                                    >
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", priorityConfig.dotColor)} />
                                                        {priorityConfig.label}
                                                    </Badge>

                                                    {/* Category Badge */}
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs font-medium px-3 py-1 bg-muted/80 hover:bg-muted transition-all duration-200 hover:scale-105"
                                                    >
                                                        {issue.category}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Enhanced Expand/Collapse Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "shrink-0 h-9 w-9 rounded-full transition-all duration-200",
                                                    "hover:bg-primary/10 hover:text-primary",
                                                    isExpanded && "bg-primary/10 text-primary rotate-180"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleIssue(issue.id);
                                                }}
                                            >
                                                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    {/* Expanded Content with smooth animation */}
                                    {isExpanded && (
                                        <CardContent className="relative pt-0 pb-6 pl-6 pr-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {/* Description */}
                                            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1 h-4 bg-primary/60 rounded-full" />
                                                    <h4 className="text-sm font-semibold text-foreground">Description</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                    {issue.description}
                                                </p>
                                            </div>

                                            {/* Timeline Information */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Created Date */}
                                                <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                                            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            Created
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground pl-7">
                                                        {createdAt?.toLocaleDateString("en-US", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                    </p>
                                                </div>

                                                {/* Updated Date */}
                                                {issue.updatedAt && (
                                                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                                                                <Clock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <p className="text-xs font-medium text-muted-foreground">
                                                                Last Updated
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-foreground pl-7">
                                                            {updatedAt?.toLocaleDateString("en-US", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Issue ID */}
                                            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-900/30">
                                                        <Hash className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <p className="text-xs font-medium text-muted-foreground">Issue Reference</p>
                                                </div>
                                                <div className="pl-7">
                                                    <code className="text-xs font-mono bg-background/60 px-2.5 py-1 rounded border border-border/40 inline-block">
                                                        {issue.id}
                                                    </code>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}