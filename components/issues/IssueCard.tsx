import { Issue } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ISSUE_CATEGORIES } from '@/constants';
import { PriorityBadge, StatusBadge, TimeAgoBadge } from './StatusBadge';

interface IssueCardProps {
    issue: Issue;
    onClick?: () => void;
    showProperty?: boolean;
    className?: string;
}

export function IssueCard({ issue, onClick, showProperty = false, className }: IssueCardProps) {
    const category = ISSUE_CATEGORIES.find(c => c.value === issue.category);

    return (
        <Card
            className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border-border/50",
                className
            )}
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-lg">
                            {category?.icon || '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-1">
                                {issue.title}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">
                                {category?.label || issue.category}
                            </p>
                        </div>
                    </div>
                    <PriorityBadge priority={issue.priority} />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {issue.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {issue.roomNumber && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            Room {issue.roomNumber}
                        </span>
                    )}

                    {showProperty && issue.propertyName && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            {issue.propertyName}
                        </span>
                    )}

                    {!issue.isAnonymous && issue.guestName && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            {issue.guestName}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <StatusBadge status={issue.status} />
                    <TimeAgoBadge date={issue.createdAt} />
                </div>
            </CardContent>
        </Card>
    );
}
