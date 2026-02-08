import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "default" | "primary" | "success" | "warning" | "danger";
    className?: string;
}

export const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = "default",
    className,
}: StatCardProps) => {
    const variants = {
        default: "bg-card text-foreground",
        primary: "bg-primary text-primary-foreground",
        success: "bg-secondary text-foreground",
        warning: "bg-secondary text-foreground",
        danger: "bg-destructive/10 text-foreground",
    };

    const iconVariants = {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary-foreground/15 text-primary-foreground",
        success: "bg-muted text-foreground",
        warning: "bg-muted text-foreground",
        danger: "bg-destructive/15 text-destructive",
    };

    return (
        <Card
            className={cn(
                "border border-border shadow-sm overflow-hidden",
                variants[variant],
                className
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p
                            className={cn(
                                "text-sm font-medium",
                                variant === "primary"
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                            )}
                        >
                            {title}
                        </p>

                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-display font-bold">
                                {value}
                            </span>

                            {trend && (
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        trend.isPositive
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-red-600 dark:text-red-400"
                                    )}
                                >
                                    {trend.isPositive ? "+" : ""}
                                    {trend.value}%
                                </span>
                            )}
                        </div>

                        {subtitle && (
                            <p
                                className={cn(
                                    "text-xs",
                                    variant === "primary"
                                        ? "text-primary-foreground/60"
                                        : "text-muted-foreground"
                                )}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            iconVariants[variant]
                        )}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
