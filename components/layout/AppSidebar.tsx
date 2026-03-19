import { cn } from '@/lib/utils';
import { LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/constants';
import Link from 'next/link';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Role } from '@/types';
import { ProfileInfo } from './ProfileInfo';
import { useUserStore } from '@/store/useUserStore';

type AppSidebarProps = {
    sidebarOpen: boolean
    role: Role
    isVerified: boolean
    inheritedFrom: string | undefined
    isOwner: boolean | undefined
}

/** Lightweight skeleton that renders inside the sidebar column — no full-screen takeover */
function SidebarSkeleton() {
    return (
        <>
            {/* User info card */}
            <div className="p-4 mx-4 mt-4 rounded-xl bg-sidebar-accent">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-14" />
                    </div>
                </div>
            </div>

            {/* Nav rows */}
            <nav className="flex-1 p-4 space-y-1">
                <Skeleton className="h-3 w-20 mx-3 mb-3" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <Skeleton className="h-5 w-5 rounded shrink-0" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </nav>
        </>
    );
}

export function AppSidebar({ sidebarOpen, role, isVerified, inheritedFrom, isOwner }: AppSidebarProps) {
    const { currentUser, loading, handleSignOut } = useCurrentUser()

    const { currentUser: user } = useUserStore()
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(sidebarOpen ?? false);

    if (!role) return null;

    const isLoading = loading || (role === "admin" && isOwner === undefined);

    const navLinks = NAV_LINKS[role];

    const filteredNavLinks =
        role === "admin" && inheritedFrom && !isOwner
            ? navLinks.filter(
                (link) =>
                    link.href !== "/admin/collaborators" &&
                    link.href !== "/owner",
            )
            : navLinks;

    const shouldShowNavigation = role === 'guest' || isVerified;

    return (
        <>
            {/* Mobile toggle */}
            <Button
                onClick={() => setIsOpen(prev => !prev)}
                variant="ghost"
                className="fixed top-4 left-4 z-51 lg:hidden p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
            >
                {isOpen ? <X className="h-11 w-11 text-foreground" /> : <Menu className="h-11 w-11 text-foreground" />}
            </Button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform duration-300 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0"
                )}

            >

                {/* Loading state — inline, no full-screen takeover */}
                {isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <>
                        {/* User Info */}
                        <div className="p-4 mx-4 mt-4 rounded-xl bg-sidebar-accent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-semibold mt-14">
                                    <ProfileInfo />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                                        {currentUser?.displayName || user?.displayName}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <p className="text-xs text-sidebar-foreground/60 capitalize">
                                            {role}
                                        </p>
                                        {!isVerified && role !== 'guest' && (
                                            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-warning/20 text-warning">
                                                Unverified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Warning */}
                        {!isVerified && role !== 'guest' && (
                            <div className="mx-4 mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                                <div className="flex items-start gap-2">
                                    <ShieldAlert className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-warning">
                                            Limited Access
                                        </p>
                                        <p className="text-xs text-sidebar-foreground/60 mt-1">
                                            Your account is pending verification. Navigation is restricted until verified.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            <p className="px-3 py-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                                Navigation
                            </p>

                            {shouldShowNavigation ? (
                                filteredNavLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(prev => !prev)}
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
                                })
                            ) : (
                                filteredNavLinks.map((link) => {
                                    const Icon = link.icon;

                                    return (
                                        <div
                                            key={link.href}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/30 cursor-not-allowed opacity-50"
                                            title="Available after verification"
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{link.label}</span>
                                        </div>
                                    );
                                })
                            )}
                        </nav>
                    </>
                )}

                {/* Logout — always visible */}
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
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}