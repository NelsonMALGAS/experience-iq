import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

export const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = 'default',
    className
}: StatCardProps) => {
    const variants = {
        default: 'bg-card',
        primary: 'bg-gradient-primary text-primary-foreground',
        success: 'bg-status-resolved-bg border-status-resolved/20',
        warning: 'bg-status-progress-bg border-status-progress/20',
        danger: 'bg-status-open-bg border-status-open/20',
    };

    const iconVariants = {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-white/20 text-primary-foreground',
        success: 'bg-status-resolved/10 text-status-resolved',
        warning: 'bg-status-progress/10 text-status-progress',
        danger: 'bg-status-open/10 text-status-open',
    };

    return (
        <Card className={cn("border shadow-sm overflow-hidden", variants[variant], className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className={cn(
                            "text-sm font-medium",
                            variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}>
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className={cn(
                                "text-3xl font-display font-bold",
                                variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
                            )}>
                                {value}
                            </span>
                            {trend && (
                                <span className={cn(
                                    "text-sm font-medium",
                                    trend.isPositive ? 'text-status-resolved' : 'text-status-open'
                                )}>
                                    {trend.isPositive ? '+' : ''}{trend.value}%
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className={cn(
                                "text-xs",
                                variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            )}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        iconVariants[variant]
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
