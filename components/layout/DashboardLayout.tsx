"use client"

import { ReactNode, useEffect, useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '@/db/client';
import useCurrentUser from '@/hooks/useCurrentUser';
import { AppUser, Role } from '@/types';
import { useRouter } from "next/navigation";
import { AppSidebar } from './AppSidebar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';
import LoadingState from '../LoadingState';


export interface DashboardLayoutProps {
    children: ReactNode;
    role: Role;
    uid: AppUser["uid"];
    isVerified: boolean;
    adminId: string | null | undefined
}

export function DashboardLayout({ children, role, uid, isVerified: serverIsVerified, adminId }: DashboardLayoutProps) {
    const { currentUser, loading, handleSignOut } = useCurrentUser();
    const { fetchUserInfo, currentUser: user } = useUserStore();
    const isAuthenticated = !loading && !!uid;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // Track verification status from server and Firestore
    const [isVerified, setIsVerified] = useState(serverIsVerified);

    // 🔥 Realtime Firestore user listener
    useEffect(() => {
        if (!uid || !db) return;

        const userRef = doc(db, "users", uid);

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (!snapshot.exists()) return;

            const userData = snapshot.data() as AppUser;

            fetchUserInfo(snapshot.id, userData);

            // Update verification status from Firestore (for staff/admin only)
            if (role !== 'guest') {
                setIsVerified(userData.isVerified ?? false);
            }
        });

        return () => unsubscribe();
    }, [uid, fetchUserInfo, role]);

    useEffect(() => {
        if (!loading && !uid) {
            router.replace(`/login?role=${role}`);
        }
    }, [loading, uid, role, router]);

    if (loading) return <LoadingState message='Loading Dashboard...' />

    if (!isAuthenticated) {
        return null;
    }

    // Use the tracked verification status (guest is always verified)
    const effectiveIsVerified = role === 'guest' ? true : isVerified;

    return (
        <div className="min-h-screen bg-background flex w-full">
            <AppSidebar
                sidebarOpen={sidebarOpen}
                role={user?.role || role}
                isVerified={effectiveIsVerified}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {/* Mobile Header */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="hidden sm:block">
                                <p className="text-sm text-muted-foreground">Welcome back,</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground">
                                        {currentUser?.displayName || currentUser?.email}
                                    </p>
                                    {!effectiveIsVerified && role !== 'guest' && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning border border-warning/20">
                                            Pending Verification
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <NotificationCenter role={role} uid={uid} adminId={adminId} />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSignOut}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}