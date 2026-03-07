import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/types";
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
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner";
import Unverified from "@/components/Unverified";


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
    const { uid, isVerified, canAccessData, subscription, adminId, adminType, inheritedFrom } = verificationResult;


    // 🚫 Unverified state (this is fast because no data fetching)
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} />
    }

    if ((!subscription || !subscription.hasAccess) && adminType === "main" && !inheritedFrom) {
        return <SubscriptionBanner type="admin" />
    }

    // 🚀 CRITICAL OPTIMIZATION: Return INSTANT shell, stream data sections
    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={true} adminId={adminId} inheritedFrom={inheritedFrom}>
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
                        <StatsSection uid={uid} inheritedFrom={inheritedFrom} />
                    </Suspense>

                    <Suspense fallback={<PropertiesSkeleton />}>
                        <PropertiesSection uid={uid} inheritedFrom={inheritedFrom} />
                    </Suspense>

                    <Suspense fallback={<IssuesSkeleton />}>
                        <RecentIssuesSection uid={uid} role={role} inheritedFrom={inheritedFrom} />
                    </Suspense>

                    <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse"><div className="h-64 bg-muted rounded" /><div className="h-64 bg-muted rounded lg:col-span-2" /></div>}>
                        <CriticalIssuesSection uid={uid} inheritedFrom={inheritedFrom} />
                    </Suspense>
                </div>
            </DashboardLayout>
        </div>
    );
}

export default AdminDashboard;