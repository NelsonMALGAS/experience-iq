import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/types";
import { AlertCircle, CheckCircle2, Loader2, Users, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cookies } from "next/headers";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { RefreshButton } from "@/components/layout/RefreshButton";
import { Metadata } from "next";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Suspense } from "react";
import StatsGridSkeleton from "@/components/skeletons/StatsGridSkeleton";
import StatsSection from "@/components/sections/StaffStatsSection";
import PerformanceSkeleton from "@/components/skeletons/PerformanceSkeleton";
import PerformanceSection from "@/components/sections/PerformanceSection";
import IssuesListSkeleton from "@/components/skeletons/IssuesListSkeleton";
import ActiveIssuesSection from "@/components/sections/ActiveIssueSection";
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner";

export const metadata: Metadata = {
    title: "Staff Dashboard – ExperienceIQ",
    description:
        "Staff dashboard to view assigned issues, track resolution progress, and manage workload efficiently. Monitor SLA compliance and performance metrics in real time.",
    keywords: [
        ...baseKeywords,
        "staff dashboard",
        "assigned issues",
        "issue management",
        "workload management",
        "SLA compliance",
        "staff performance",
        "hotel staff app",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Staff Dashboard – ExperienceIQ",
        description:
            "View assigned issues, track resolution progress, and manage workload efficiently. Monitor SLA compliance in real time.",
        url: `${baseUrl}/staff`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Staff Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Staff Dashboard – ExperienceIQ",
        description:
            "View assigned issues and track resolution progress. Monitor SLA compliance in real time.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}



const StaffDashboard = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff";

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, adminId, subscription } = verificationResult;


    if (!canAccessData) {
        return (
            <div className="mt-16 sm:mt-20 lg:mt-24">
                <DashboardLayout role={role} uid={uid} isVerified={isVerified}>
                    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                                    Staff Dashboard
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                    Manage and resolve guest issues efficiently
                                </p>
                            </div>
                            <RefreshButton />
                        </div>

                        <Card className="border-warning bg-warning/5">
                            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                <ShieldAlert className="h-12 w-12 sm:h-16 sm:w-16 text-warning mb-4" />
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                                    Account Pending Verification
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md px-4">
                                    Your account is currently pending verification by an administrator.
                                    You&apos;ll be able to access issue data and staff tools once your account is verified.
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Please contact your administrator if you believe this is an error.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 opacity-50 pointer-events-none">
                            <StatCard title="My Assigned" value="—" subtitle="Access restricted" icon={Users} variant="primary" />
                            <StatCard title="Open Issues" value="—" subtitle="Access restricted" icon={AlertCircle} variant="danger" />
                            <StatCard title="In Progress" value="—" subtitle="Access restricted" icon={Loader2} variant="warning" />
                            <StatCard title="Resolved Today" value="—" icon={CheckCircle2} variant="success" />
                        </div>
                    </div>
                </DashboardLayout>
            </div>
        );
    }

    if (!subscription || !adminId || !subscription.hasAccess) {
        return <SubscriptionBanner type="staff" />
    }

    // 🚀 INSTANT shell with progressive streaming
    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={true}>
                <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* ✅ INSTANT header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                                Staff Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Manage and resolve guest issues efficiently
                            </p>
                        </div>
                        <RefreshButton />
                    </div>

                    {/* 🚀 Progressive streaming sections */}
                    <Suspense fallback={<StatsGridSkeleton />}>
                        <StatsSection uid={uid} adminId={adminId} />
                    </Suspense>

                    <Suspense fallback={<PerformanceSkeleton />}>
                        <PerformanceSection uid={uid} adminId={adminId} />
                    </Suspense>

                    <Suspense fallback={<IssuesListSkeleton />}>
                        <ActiveIssuesSection uid={uid} role={role} adminId={adminId} />
                    </Suspense>
                </div>
            </DashboardLayout>
        </div>
    );
}

export default StaffDashboard;