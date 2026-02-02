import { Issue } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import {
    MapPin,
    User,
    Building2,
    ImageIcon,
    UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ISSUE_CATEGORIES } from '@/constants';
import { PriorityBadge, StatusBadge, TimeAgoBadge } from './StatusBadge';
import Image from 'next/image';

interface IssueCardProps {
    issue: Issue;
    onClick?: () => void;
    showProperty?: boolean;
    className?: string;
}

export function IssueCard({
    issue,
    onClick,
    showProperty = false,
    className,
}: IssueCardProps) {
    const category = ISSUE_CATEGORIES.find(c => c.value === issue.category);
    const hasImages = Array.isArray(issue.images) && issue.images.length > 0;

    return (
        <Card
            onClick={onClick}
            className={cn(
                'group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant',
                className
            )}
        >
            <CardContent className="p-0">
                {/* 🖼 Image strip */}
                {hasImages ? (
                    <div className="grid grid-cols-3 gap-px bg-border">
                        {issue.images!.slice(0, 3).map((src, index) => (
                            <div
                                key={index}
                                className="relative aspect-4/3 bg-muted"
                            >
                                <Image
                                    src={src}
                                    alt={`Issue image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                {index === 2 && issue.images!.length > 3 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                                        +{issue.images!.length - 3} more
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 border-b border-border/50 bg-muted/30 py-6 text-xs text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        No images attached
                    </div>
                )}

                {/* 📄 Content */}
                <div className="space-y-4 p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-lg">
                                {category?.icon || '📝'}
                            </span>
                            <span className="capitalize">
                                {category?.label || issue.category}
                            </span>
                        </div>
                        <PriorityBadge priority={issue.priority} />
                    </div>

                    {/* Title + description */}
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                            {issue.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {issue.description}
                        </p>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        {issue.roomNumber && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                Room {issue.roomNumber}
                            </span>
                        )}

                        {showProperty && issue.propertyName && (
                            <span className="inline-flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {issue.propertyName}
                            </span>
                        )}

                        {!issue.isAnonymous && issue.guestName && (
                            <span className="inline-flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {issue.guestName}
                            </span>
                        )}

                        {issue.assignedToName ? (
                            <span className="inline-flex items-center gap-1 text-foreground">
                                <UserCheck className="h-3.5 w-3.5" />
                                {issue.assignedToName}
                            </span>
                        ) : (
                            <span className="italic text-muted-foreground/70">
                                Unassigned
                            </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <StatusBadge status={issue.status} />
                        <TimeAgoBadge date={issue.createdAt} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
