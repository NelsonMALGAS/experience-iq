
import { cn } from '@/lib/utils';
import { LogOut, Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/constants';
import Link from 'next/link';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Role } from '@/types';
import { ProfileInfo } from './ProfileInfo';
import LoadingState from '../LoadingState';

type AppSidebarProps = {
    sidebarOpen: boolean
    role: Role
}

export function AppSidebar({ sidebarOpen, role }: AppSidebarProps) {
    const { currentUser, loading, handleSignOut } = useCurrentUser()
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(sidebarOpen);

    if (!role) return null;

    if (loading) return <LoadingState />

    const navLinks = NAV_LINKS[role];

    return (
        <>
            {/* Mobile toggle */}
            <Button
                onClick={() => setIsCollapsed(!isCollapsed)}
                variant="ghost"
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
            >
                {isCollapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
                    isCollapsed ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-64"
                )}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-sidebar-border">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-lg font-semibold text-sidebar-foreground">
                                GuestCare
                            </span>
                            <span className="text-xs text-sidebar-foreground/60">
                                Service Recovery
                            </span>
                        </div>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 mx-4 mt-4 rounded-xl bg-sidebar-accent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-semibold">
                            <ProfileInfo />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {currentUser?.displayName}
                            </p>
                            <p className="text-xs text-sidebar-foreground/60 capitalize">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 py-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                        Navigation
                    </p>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsCollapsed(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-sidebar-border">
                    <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isCollapsed && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsCollapsed(false)}
                />
            )}
        </>
    );
}
