"use client"

import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
} from "firebase/firestore";
import { db } from "@/db/client";
import { AppUser, Issue, Role } from '@/types';
import { toDate } from '@/utils/issueDetailsUtils';
import { NotificationItem } from './NotificationContentAndIcon';

type NotificationCenterType = {
    role: Role
    uid: AppUser["uid"]
}

export function NotificationCenter({ role, uid }: NotificationCenterType) {
    const {
        notifications,
        unreadCount,
        setNotifications,
        markAllAsRead,
        clearAll,
    } = useNotifications();
    const [open, setOpen] = useState(false);

    const handleClose = () => setOpen(false);

    // Subscribe to Firestore issues
    useEffect(() => {
        const q = collection(db, "issues");

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const nextNotifications: Notification[] = [];

                snapshot.docs.forEach((docSnap) => {
                    const data = docSnap.data();
                    const issues: Issue[] = data.issues ?? [];

                    issues.forEach((issue) => {
                        const status = issue.status ?? "open";
                        const assigned = !!issue.assignedTo;

                        // ✅ Firebase-based read logic: check if uid is in readBy array
                        const isRead = issue.readBy?.includes(uid) === true;

                        let title = "New Issue Created";
                        let type: Notification["type"] = "info";

                        if (assigned || status === "in_progress") {
                            title = "Issue Assigned";
                            type = "warning";
                        } else if (status === "resolved") {
                            title = "Issue Resolved";
                            type = "success";
                        }

                        if (!issue.readBy?.includes(uid)) {
                            nextNotifications.push({
                                colId: docSnap.id,
                                id: issue.id,
                                title,
                                message: issue.title || issue.description || "No details available",
                                type,
                                read: isRead,
                                createdAt: toDate(issue.createdAt) ?? new Date(),
                                link: role === "staff"
                                    ? `/staff/issues/${issue.id}`
                                    : `/admin/issues/${issue.id}`,
                            });
                        }
                    });
                });

                setNotifications(nextNotifications);
            },
            (error) => {
                console.error("❌ Issues snapshot error:", error);
            }
        );

        return unsubscribe;
    }, [setNotifications, role, uid]);

    const handleMarkAllAsRead = () => {
        markAllAsRead(uid);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
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
                                onClick={handleMarkAllAsRead}
                                className="h-7 text-xs"
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-100">
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
                                    onClose={handleClose}
                                    uid={uid}
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
                            className="w-full text-xs text-muted-foreground hover:text-foreground"
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