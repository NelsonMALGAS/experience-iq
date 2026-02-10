import { cn } from '@/lib/utils';
import { formatDistanceToNow } from "date-fns"
import { useRouter } from 'next/navigation';
import { Trash2, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Notification, useNotifications } from '@/contexts/NotificationContext';
import { addLocalReadIssueId } from '@/lib/rosterHelpers';

export function NotificationIcon({ type }: { type: Notification['type'] }) {
    const icons = {
        info: <Info className="h-4 w-4 text-blue-500" />,
        success: <CheckCircle2 className="h-4 w-4 text-status-resolved" />,
        warning: <AlertTriangle className="h-4 w-4 text-secondary" />,
        error: <XCircle className="h-4 w-4 text-destructive" />,
    };
    return icons[type];
}

export function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
    const { clearNotification, markAsRead } = useNotifications();
    const router = useRouter();

    const handleClick = () => {
        // Add to localStorage (per-user acknowledgement)
        if (!notification.read) {
            markAsRead(notification.id)
            addLocalReadIssueId(notification.id);
        }

        // Navigate if link exists
        if (notification.link) {
            router.push(notification.link);
            onClose();
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearNotification(notification.id);
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
                        onClick={handleDelete}
                        className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                        aria-label="Delete notification"
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