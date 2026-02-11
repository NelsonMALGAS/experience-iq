"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/db/client";
import { Issue } from "@/types";
import { toast } from "sonner";

export interface Notification {
    colId: string
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: Date;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    markAsRead: (id: string, uid: string) => void;
    markAllAsRead: (uid: string) => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = useCallback(
        async (id: string, uid: string) => {
            const notif = notifications.find((n) => n.id === id);
            if (!notif || !notif.colId) return;

            // Check if already read by this user
            if (notif.read) return;

            // Optimistic UI update
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );

            try {
                const parentRef = doc(db, "issues", notif.colId);
                const parentSnap = await getDoc(parentRef);

                if (!parentSnap.exists()) {
                    throw new Error("Document not found");
                }

                const parentData = parentSnap.data();
                const issues: Issue[] = parentData.issues ?? [];

                // Update only the specific issue
                const updatedIssues = issues.map((issue) => {
                    if (issue.id === id) {
                        // Check if uid already in readBy
                        const readBy = issue.readBy || [];
                        if (readBy.includes(uid)) {
                            return issue; // No change needed
                        }
                        return {
                            ...issue,
                            readBy: [...readBy, uid],
                        };
                    }
                    return issue;
                });

                // Only write if something changed
                const hasChanges = updatedIssues.some((issue, idx) =>
                    issue !== issues[idx]
                );

                if (hasChanges) {
                    await updateDoc(parentRef, { issues: updatedIssues });
                }

                toast.success("🎉 Success", { description: "Marked as read" });
            } catch (e) {
                console.error("Failed to mark as read:", e);
                toast.error("Failed to mark as read");

                // Rollback UI
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: false } : n))
                );
            }
        },
        [notifications]
    );

    const markAllAsRead = useCallback(
        async (uid: string) => {
            const unread = notifications.filter((n) => !n.read);
            if (unread.length === 0) return;

            // Optimistic UI
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

            try {
                // Group by parent document
                const parentMap = new Map<string, Notification[]>();
                unread.forEach((n) => {
                    if (!n.colId) return;
                    if (!parentMap.has(n.colId)) parentMap.set(n.colId, []);
                    parentMap.get(n.colId)!.push(n);
                });

                // Process each document
                for (const [colId, notificationsToUpdate] of parentMap) {
                    const parentRef = doc(db, "issues", colId);
                    const parentSnap = await getDoc(parentRef);

                    if (!parentSnap.exists()) continue;

                    const parentData = parentSnap.data();
                    const issues: Issue[] = parentData.issues ?? [];

                    // Update readBy for relevant issues
                    const updatedIssues = issues.map((issue) => {
                        const shouldUpdate = notificationsToUpdate.find((n) => n.id === issue.id);
                        if (shouldUpdate) {
                            const readBy = issue.readBy || [];
                            if (!readBy.includes(uid)) {
                                return {
                                    ...issue,
                                    readBy: [...readBy, uid],
                                };
                            }
                        }
                        return issue;
                    });

                    // Only write if something changed
                    const hasChanges = updatedIssues.some((issue, idx) =>
                        issue !== issues[idx]
                    );

                    if (hasChanges) {
                        await updateDoc(parentRef, { issues: updatedIssues });
                    }
                }

                toast.success("All marked as read");
            } catch (e) {
                console.error("Failed to mark all as read:", e);
                toast.error("Failed to mark all as read");

                // Rollback
                setNotifications((prev) =>
                    prev.map((n) => {
                        const wasUnread = unread.find((u) => u.id === n.id);
                        return wasUnread ? { ...n, read: false } : n;
                    })
                );
            }
        },
        [notifications]
    );

    const clearNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                setNotifications,
                markAsRead,
                markAllAsRead,
                clearNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
}