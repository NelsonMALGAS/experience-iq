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
import { addLocalReadIssueId } from "@/lib/rosterHelpers";

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
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
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
        async (id: string) => {
            const notif = notifications.find((n) => n.id === id);
            if (!notif || !notif.colId) return;

            addLocalReadIssueId(id);

            // Optimistic UI
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );

            try {
                const parentRef = doc(db, "issues", notif.colId);
                const parentSnap = await getDoc(parentRef);

                if (!parentSnap.exists()) return;
                const parentData = parentSnap.data();
                const issues: Issue[] = parentData.issues ?? [];

                const updatedIssues = issues.map((issue) =>
                    issue.id === id ? { ...issue, read: true } : issue
                );

                await updateDoc(parentRef, { issues: updatedIssues });
                toast.success("🎉 Success", { description: `Issue ID:${notif.id} successfully marked as read` })
            } catch (e) {
                toast.error("🚨 Error", { description: `Failed to mark issues ID:${notif.id} as read, ${e}` });
                // rollback UI
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: false } : n))
                );
            }
        },
        [notifications]
    );


    const markAllAsRead = useCallback(async () => {
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

            for (const [colId, notificationsToUpdate] of parentMap) {
                const parentRef = doc(db, "issues", colId);
                const parentSnap = await getDoc(parentRef);
                if (!parentSnap.exists()) continue;

                const parentData = parentSnap.data();
                const issues: Issue[] = parentData.issues ?? [];

                const updatedIssues = issues.map((issue) =>
                    notificationsToUpdate.find((n) => n.id === issue.id)
                        ? { ...issue, read: true }
                        : issue
                );

                await updateDoc(parentRef, { issues: updatedIssues });
                toast.success("🎉 Success", { description: "Issues successfully marked as read" })
            }
        } catch (e) {
            toast.error("🚨 Error", { description: `Failed to mark all as read, ${e}` });
            // rollback
            setNotifications((prev) =>
                prev.map((n) =>
                    unread.find((u) => u.id === n.id) ? { ...n, read: false } : n
                )
            );
        }
    }, [notifications]);


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
