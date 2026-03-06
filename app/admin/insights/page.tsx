import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardLayoutSkeleton from "@/components/layout/DashboardLayoutSkeleton";
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Unverified from "@/components/Unverified";
import { aiInsights, criticalAlerts, insights } from "@/constants/dummyData";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { AlertTriangle, BarChart3, Clock, Activity, Sparkles, TrendingUp } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Experience Intelligence – ExperienceIQ",
    description:
        "Real-time guest satisfaction analytics, service performance monitoring, and operational risk detection for hospitality leaders.",
    keywords: [
        ...baseKeywords,
        "guest experience",
        "satisfaction analytics",
        "operational intelligence",
        "sentiment analysis",
        "service monitoring",
        "hospitality insights",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Experience Intelligence – ExperienceIQ",
        description:
            "Real-time guest satisfaction analytics and operational intelligence for hospitality leaders.",
        url: `${baseUrl}/admin/insights`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Experience Intelligence Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Experience Intelligence – ExperienceIQ",
        description: "Real-time guest satisfaction analytics and operational intelligence.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

const InsightsPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, subscription, adminId } = verificationResult;
    const userRole = role || "admin"

    if (!uid) redirect(`/login?role=${role}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={userRole} uid={uid} />
    }

    if (!subscription || !subscription.hasAccess) {
        return <SubscriptionBanner type="admin" />
    }



    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <div className="mt-16 sm:mt-20 lg:mt-24">
                <DashboardLayout role={role || "admin"} uid={uid} isVerified={isVerified} adminId={adminId}>
                    <div className="space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8">

                        {/* ===== HEADER SECTION ===== */}
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                                        ExperienceIQ Intelligence
                                    </h1>
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                        Live Data
                                    </Badge>
                                </div>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    Real-time guest satisfaction insights and operational intelligence
                                </p>
                            </div>
                        </div>

                        {/* ===== KPI CARDS - RESPONSIVE GRID ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

                            {/* Overall Satisfaction Card */}
                            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold tabular-nums">
                                                {insights.overallSatisfaction}
                                                <span className="text-lg text-muted-foreground">/5</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Overall Satisfaction
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>↑ 3% this week</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Alerts Card */}
                            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {insights.activeAlerts}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Active Alerts
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>Requires attention</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Avg Response Time Card */}
                            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {insights.avgResponseTime}
                                                <span className="text-lg text-muted-foreground">m</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Avg Response Time
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                                <TrendingUp className="h-3 w-3 rotate-180" />
                                                <span>12% faster</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sentiment Risk Card */}
                            <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                                            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {insights.sentimentRisk}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Sentiment Risk
                                            </p>
                                            <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                                Moderate Risk
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ===== CRITICAL ALERTS & AI INSIGHTS - TWO COLUMN LAYOUT ===== */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                            {/* Critical Guest Alerts Section */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 border-b">
                                    <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Critical Guest Alerts
                                    </CardTitle>
                                    <CardDescription>
                                        Active issues requiring immediate attention
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    {criticalAlerts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                                <BarChart3 className="w-8 h-8 text-green-600" />
                                            </div>
                                            <h3 className="text-base font-semibold mb-2">All guests are satisfied</h3>
                                            <p className="text-sm text-muted-foreground text-center">
                                                No critical alerts at this time
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {criticalAlerts.map((alert, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col gap-2 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-semibold text-sm truncate">
                                                                {alert.guest}
                                                            </span>
                                                            <Badge variant="outline" className="shrink-0">
                                                                Room {alert.roomNumber}
                                                            </Badge>
                                                        </div>
                                                        <Badge
                                                            className={
                                                                alert.severity === "high"
                                                                    ? "bg-red-100 text-red-800 border-red-200 shrink-0"
                                                                    : "bg-yellow-100 text-yellow-800 border-yellow-200 shrink-0"
                                                            }
                                                        >
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.issue}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reported {alert.reportedMinutesAgo} minutes ago
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* AI Operational Insights Section */}
                            <Card className="shadow-sm border-purple-200 bg-linear-to-br from-card/50 to-card/50">
                                <CardHeader className="pb-4 border-b">
                                    <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        AI Operational Insights
                                    </CardTitle>
                                    <CardDescription>
                                        Intelligent analysis of operational patterns
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-3">
                                        {aiInsights.map((insight, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
                                            >
                                                <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {insight.insight}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bottom Spacing for Mobile */}
                        <div className="h-4 sm:h-0" />
                    </div>
                </DashboardLayout>
            </div>
        </Suspense>
    )
}

export default InsightsPage