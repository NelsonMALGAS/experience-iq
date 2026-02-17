import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Role } from "@/types";
import { AlertCircle, BarChart3, Clock, TrendingUp, ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { RefreshButton } from "@/components/layout/RefreshButton";
import { Metadata } from "next";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Suspense } from "react";
import StatsGridSkeleton from "@/components/skeletons/StatsGridSkeleton";
import StatsSection from "@/components/sections/StatsSection";
import PropertiesSkeleton from "@/components/skeletons/PropertiesSkeleton";
import IssuesSkeleton from "@/components/skeletons/IssuesSkeleton";
import PropertiesSection from "@/components/sections/PropertiesSection";
import RecentIssuesSection from "@/components/sections/RecentIssuesSection";
import CriticalIssuesSection from "@/components/sections/CriticalIssuesSection";

export const metadata: Metadata = {
    title: "Executive Overview – ExperienceIQ",
    description:
        "Admin dashboard to monitor guest experience across all properties. View analytics, SLA compliance, critical issues, staff performance, and property-wide metrics in real time.",
    keywords: [
        ...baseKeywords,
        "admin dashboard",
        "executive overview",
        "analytics",
        "property management",
        "performance metrics",
        "hotel analytics",
        "multi-property management",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Executive Overview – ExperienceIQ",
        description:
            "Monitor guest experience across all properties. View analytics, SLA compliance, and performance metrics in real time.",
        url: `${baseUrl}/admin`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Admin Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Executive Overview – ExperienceIQ",
        description:
            "Monitor guest experience across all properties. View analytics and SLA compliance.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}


const AdminDashboard = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    // ✅ Auth check is ONLY thing that blocks
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;

    // 🚫 Unverified state (this is fast because no data fetching)
    if (!canAccessData) {
        return (
            <div className="mt-16 sm:mt-20 lg:mt-24">
                <DashboardLayout role={role} uid={uid} isVerified={isVerified}>
                    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                                    Executive Overview
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                    Monitor guest experience across all properties
                                </p>
                            </div>
                            <RefreshButton />
                        </div>

                        <Card className="border-warning bg-warning/5">
                            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                <ShieldAlert className="h-12 w-12 sm:h-16 sm:w-16 text-warning mb-4" />
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">
                                    Account Pending Verification
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md px-4">
                                    Your administrator account is currently pending verification.
                                    You&apos;ll gain full access to property analytics, issue management,
                                    user administration, and all executive tools once verified.
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Please contact the system administrator if you need immediate access.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 opacity-50 pointer-events-none">
                            <StatCard title="Total Issues" value="—" subtitle="Access restricted" icon={BarChart3} variant="primary" />
                            <StatCard title="Open Issues" value="—" subtitle="Access restricted" icon={AlertCircle} variant="danger" />
                            <StatCard title="Avg. Resolution" value="—" subtitle="Access restricted" icon={Clock} />
                            <StatCard title="SLA Compliance" value="—" icon={TrendingUp} variant="warning" />
                        </div>
                    </div>
                </DashboardLayout>
            </div>
        );
    }

    // 🚀 CRITICAL OPTIMIZATION: Return INSTANT shell, stream data sections
    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={true}>
                <div className="space-y-6 sm:space-y-8 px-2 sm:px-6 lg:px-8">
                    {/* ✅ INSTANT: Header renders immediately with no await */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                                Executive Overview
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Monitor guest experience across all properties
                            </p>
                        </div>
                        <RefreshButton />
                    </div>

                    {/* 🚀 STREAMING: Each section loads independently */}
                    <Suspense fallback={<StatsGridSkeleton />}>
                        <StatsSection />
                    </Suspense>

                    <Suspense fallback={<PropertiesSkeleton />}>
                        <PropertiesSection />
                    </Suspense>

                    <Suspense fallback={<IssuesSkeleton />}>
                        <RecentIssuesSection uid={uid} role={role} />
                    </Suspense>

                    <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse"><div className="h-64 bg-muted rounded" /><div className="h-64 bg-muted rounded lg:col-span-2" /></div>}>
                        <CriticalIssuesSection />
                    </Suspense>
                </div>
            </DashboardLayout>
        </div>
    );
}

export default AdminDashboard;