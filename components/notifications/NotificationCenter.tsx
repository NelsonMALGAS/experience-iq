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
import { useState, useEffect, useRef } from 'react';
import {
    collection,
    onSnapshot,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "@/db/client";
import { AppUser, Issue, Role } from '@/types';
import { toDate } from '@/utils/issueDetailsUtils';
import { NotificationItem } from './NotificationContentAndIcon';


type NotificationCenterType = {
    role: Role
    uid: AppUser["uid"]
    adminId: string | null | undefined
    inheritedFrom: string | undefined
}

const getStorageKey = (uid: string) => `notification_count_${uid}`;

export function NotificationCenter({ role, uid, adminId, inheritedFrom }: NotificationCenterType) {
    const {
        notifications,
        unreadCount,
        setNotifications,
        markAllAsRead,
        clearAll,
    } = useNotifications();
    const [open, setOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Tracks whether this is the initial mount — prevents playing on navigation/sign-in
    const isInitialMount = useRef(true);

    // Preload the notification sound once on mount
    useEffect(() => {
        audioRef.current = new Audio('/audio/notification.wav');
        audioRef.current.preload = 'auto';
    }, []);

    // Play sound only when unread count genuinely increases beyond the last persisted value
    useEffect(() => {
        if (!uid) return;

        const storageKey = getStorageKey(uid);

        if (isInitialMount.current) {
            // On first mount (including page navigations): snapshot current count, no sound
            localStorage.setItem(storageKey, String(unreadCount));
            isInitialMount.current = false;
            return;
        }

        // After mount: only play if count grew beyond what was last saved
        const saved = parseInt(localStorage.getItem(storageKey) ?? '0', 10);

        if (unreadCount > saved) {
            audioRef.current?.play().catch(() => {
                // Browser autoplay policy may block until first user interaction
            });
        }

        // Always keep localStorage in sync
        localStorage.setItem(storageKey, String(unreadCount));

    }, [unreadCount, uid]);

    const handleClose = () => setOpen(false);

    // Subscribe to Firestore issues scoped to admin's properties
    useEffect(() => {
        // Guard: Exit if no adminId
        if (!adminId) {
            setNotifications([]);
            return;
        }

        let unsubscribe: (() => void) | undefined;
        let isMounted = true;

        const setupNotificationListener = async () => {

            const id = inheritedFrom ? inheritedFrom : adminId
            try {
                // Fetch all property IDs owned by this admin
                const propertiesQuery = query(
                    collection(db, "properties"),
                    where("ownerId", "==", id)
                );

                const propertiesSnapshot = await getDocs(propertiesQuery);

                if (propertiesSnapshot.empty) {
                    if (isMounted) setNotifications([]);
                    return;
                }

                // Extract property IDs into a Set for fast lookup
                const propertyIds = new Set(propertiesSnapshot.docs.map(doc => doc.id));

                // Subscribe to ALL issues (we'll filter by propertyId on the client side)
                // Firestore doesn't support querying nested array fields directly,
                // so we need to fetch all issue documents and filter in memory
                const issuesQuery = collection(db, "issues");

                unsubscribe = onSnapshot(
                    issuesQuery,
                    (snapshot) => {
                        if (!isMounted) return;

                        // Use a Map to prevent duplicate issue IDs
                        const notificationsMap = new Map<string, Notification>();

                        snapshot.docs.forEach((docSnap) => {
                            const data = docSnap.data();

                            // ✅ Each document has an 'issues' array field
                            const issuesArray: Issue[] = data.issues ?? [];

                            // Process each issue in the array
                            issuesArray.forEach((issue) => {
                                // ✅ CRITICAL: propertyId is INSIDE each issue object
                                // Only process issues that belong to admin's properties
                                if (!propertyIds.has(issue.propertyId)) {
                                    return; // Skip issues not owned by this admin
                                }

                                // Only process unread notifications
                                if (issue.readBy?.includes(uid)) {
                                    return; // Skip already read issues
                                }

                                const status = issue.status ?? "open";
                                const assigned = !!issue.assignedTo;

                                let title = "New Issue Created";
                                let type: Notification["type"] = "info";

                                if (assigned || status === "in_progress") {
                                    title = "Issue Assigned";
                                    type = "warning";
                                } else if (status === "resolved") {
                                    title = "Issue Resolved";
                                    type = "success";
                                }

                                const notification: Notification = {
                                    colId: docSnap.id,
                                    id: issue.id,
                                    title,
                                    message: issue.title || issue.description || "No details available",
                                    type,
                                    read: false, // We already filtered out read ones
                                    createdAt: toDate(issue.createdAt) ?? new Date(),
                                    link: role === "staff"
                                        ? `/staff/issues/${issue.id}`
                                        : `/admin/issues/${issue.id}`,
                                };

                                // ✅ Map automatically prevents duplicates by issue.id
                                notificationsMap.set(issue.id, notification);
                            });
                        });

                        // Convert Map to sorted array
                        const allNotifications = Array.from(notificationsMap.values())
                            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                        if (isMounted) {
                            setNotifications(allNotifications);
                        }
                    },
                    (error) => {
                        console.error("❌ Issues snapshot error:", error);
                    }
                );

            } catch (error) {
                console.error("❌ Error setting up notification listener:", error);
                if (isMounted) setNotifications([]);
            }
        };

        // Initialize listener
        setupNotificationListener();

        // Cleanup function
        return () => {
            isMounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [setNotifications, role, uid, adminId, inheritedFrom]);

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