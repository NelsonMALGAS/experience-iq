import { getVerifiedStaffUsers } from "@/app/optimised-actions";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardLayoutSkeleton from "@/components/layout/DashboardLayoutSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Unverified from "@/components/Unverified";
import { roleConfig } from "@/constants";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { cn } from "@/lib/utils";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { MoreHorizontal, Plus, Search, Shield, UserIcon, UsersIcon } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Users – ExperienceIQ",
    description:
        "Manage staff and admin users across all properties. Add, edit, verify users, assign roles, set permissions, and monitor user activity and performance.",
    keywords: [
        ...baseKeywords,
        "user management",
        "staff management",
        "user roles",
        "permissions",
        "user administration",
        "team management",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "User Management – ExperienceIQ",
        description:
            "Manage staff and admin users. Assign roles, set permissions, and monitor user activity.",
        url: `${baseUrl}/admin/users`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "User Management Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "User Management – ExperienceIQ",
        description: "Manage staff and admin users. Assign roles and set permissions.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

const UsersPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;
    const userRole = role || "admin"

    if (!uid) redirect(`/login?role=${role}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={userRole} uid={uid} />
    }

    const users = await getVerifiedStaffUsers()

    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <div className="mt-16 sm:mt-20 lg:mt-24">
                <DashboardLayout role={role || "admin"} uid={uid} isVerified={isVerified}>
                    <div className="space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8">

                        {/* ===== HEADER SECTION ===== */}
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Title and Description */}
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                                    User Management
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    Manage staff and administrator accounts across your organization
                                </p>
                            </div>

                            {/* Search and Action Buttons - Responsive Layout */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Search Input - Full width on mobile */}
                                <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        placeholder="Search users..."
                                        className="pl-9 h-10 sm:h-11 bg-muted/50 border-border/60 focus:border-primary/40 transition-colors"
                                    />
                                </div>

                                {/* Add User Button - Full width on mobile */}
                                <Button
                                    className="w-full sm:w-auto text-primary-foreground hover:opacity-90 shadow-lg h-10 sm:h-11 gap-2"
                                    variant="default"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="font-semibold">Add User</span>
                                </Button>
                            </div>
                        </div>

                        {/* ===== STATS CARDS - RESPONSIVE GRID ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Total Users Card */}
                            <Card className="bg-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                            <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold tabular-nums">
                                                {users.length}
                                            </p>
                                            <p className="text-xs sm:text-sm text-primary-foreground/70 truncate">
                                                Total Users
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Staff Members Card */}
                            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {users.filter(u => u.role === 'staff').length}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Staff Members
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Administrators Card */}
                            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {users.filter(u => u.role === 'admin').length}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Administrators
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ===== USERS LIST - RESPONSIVE DESIGN ===== */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4 px-4 sm:px-6 border-b">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <CardTitle className="font-display text-lg sm:text-xl">
                                        All Users
                                    </CardTitle>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {users.length} {users.length === 1 ? 'user' : 'users'} total
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6">
                                {users.length === 0 ? (
                                    /* Empty State */
                                    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                            <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold mb-2">No users found</h3>
                                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                                            Get started by adding your first user to the system
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {users.map((user, index) => (
                                            <div
                                                key={user.id}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-slide-up"
                                                style={{ animationDelay: `${index * 30}ms` }}
                                            >
                                                {/* User Info Section */}
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                    {/* Avatar */}
                                                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-sm shrink-0">
                                                        <AvatarFallback className="bg-gradient-gold text-primary font-semibold text-sm sm:text-base">
                                                            {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    {/* Name and Email */}
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                                                            {user.name || "Guest User"}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions Section */}
                                                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-auto sm:ml-0">
                                                    {/* Role Badge */}
                                                    <Badge
                                                        className={cn(
                                                            "border text-xs font-medium px-2.5 py-0.5 sm:px-3 sm:py-1",
                                                            roleConfig[user.role].color
                                                        )}
                                                    >
                                                        {roleConfig[user.role].label}
                                                    </Badge>

                                                    {/* More Options Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Bottom Spacing for Mobile */}
                        <div className="h-4 sm:h-0" />
                    </div>
                </DashboardLayout>
            </div>
        </Suspense>
    )
}

export default UsersPage