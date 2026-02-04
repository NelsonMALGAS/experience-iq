'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    User,
    MapPin,
    Calendar,
    Clock,
    Building2,
    UserCircle,
    CheckCircle2,
    Info,
    Tag,
    AlertCircle,
    Phone,
    Mail,
    Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap = {
    user: User,
    'map-pin': MapPin,
    calendar: Calendar,
    clock: Clock,
    building: Building2,
    'user-circle': UserCircle,
    'check-circle': CheckCircle2,
    info: Info,
    tag: Tag,
    'alert-circle': AlertCircle,
    phone: Phone,
    mail: Mail,
    home: Home,
} as const;

type IconName = keyof typeof iconMap;

interface MetadataItem {
    label: string;
    value: string | null | undefined;
    icon: IconName;
    fallback?: string;
    className?: string;
}

interface MetadataCardProps {
    title: string;
    icon: IconName;
    items: MetadataItem[];
}

export function MetadataCard({ title, icon, items }: MetadataCardProps) {
    const TitleIcon = iconMap[icon];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TitleIcon className="h-5 w-5 text-muted-foreground" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => {
                    const Icon = iconMap[item.icon];
                    const displayValue = item.value || item.fallback || 'N/A';
                    const isNA = !item.value;

                    return (
                        <div key={index} className="flex items-start gap-3">
                            <div className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg",
                                item.className || "bg-muted"
                            )}>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">
                                    {item.label}
                                </p>
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    isNA ? "text-muted-foreground italic" : "text-foreground"
                                )}>
                                    {displayValue}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}