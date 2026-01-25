"use client"

import { ReactNode, useEffect } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { AppUser, Role } from '@/types';
import { useRouter } from "next/navigation";
import { AppSidebar } from './AppSidebar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Button } from '../ui/button';


export interface DashboardLayoutProps {
    children: ReactNode;
    role: Role
    uid: AppUser["uid"]
}

export function DashboardLayout({ children, role, uid }: DashboardLayoutProps) {
    const { currentUser, loading, handleSignOut } = useCurrentUser()
    const isAuthenticated = !loading && !!uid
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter()

    useEffect(() => {
        if (!loading && !uid) {
            router.replace(`/login?role=${role}`);
        }
    }, [loading, uid, role, router]);

    if (loading) return <span>Loading...</span>

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex w-full">
            <AppSidebar sidebarOpen={sidebarOpen} role={role} />

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
                                <p className="font-medium text-foreground">{currentUser?.displayName || currentUser?.email} </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <NotificationCenter />
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
