"use client"

import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Trash2, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from "date-fns"
import { useRouter } from 'next/navigation';


function NotificationIcon({ type }: { type: Notification['type'] }) {
    const icons = {
        info: <Info className="h-4 w-4 text-blue-500" />,
        success: <CheckCircle2 className="h-4 w-4 text-status-resolved" />,
        warning: <AlertTriangle className="h-4 w-4 text-secondary" />,
        error: <XCircle className="h-4 w-4 text-destructive" />,
    };
    return icons[type];
}

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
    const { markAsRead, clearNotification } = useNotifications();
    const router = useRouter();

    const handleClick = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
            onClose();
        }
    };


    return (
        <div
            className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
                !notification.read && "bg-accent/50"
            )}
            onClick={handleClick}
        >
            <div className="shrink-0 mt-0.5">
                <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
                        {notification.title}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                        }}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}

export function NotificationCenter() {
    const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center animate-pulse-gold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b border-border">
                    <h4 className="font-semibold">Notifications</h4>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-7 text-xs"
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-75">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClose={() => { }}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground"
                            onClick={clearAll}
                        >
                            Clear all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
