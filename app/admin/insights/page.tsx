import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardLayoutSkeleton from "@/components/layout/DashboardLayoutSkeleton";
import { RefreshButton } from "@/components/layout/RefreshButton";
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Unverified from "@/components/Unverified";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { deriveAiInsights, deriveAvgResponseTime, deriveCriticalAlerts, deriveOverallSatisfaction, deriveSentimentRisk, severityClass } from "@/lib/insights";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { AlertTriangle, BarChart3, Clock, Activity, Sparkles, TrendingUp, MapPin } from "lucide-react";
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
};

type CriticalAlertDerived = ReturnType<typeof deriveCriticalAlerts>[number];

const InsightsPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, subscription, adminId, inheritedFrom, isOwner } =
        verificationResult;

    if (!uid) redirect(`/login?role=${role}`);

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={undefined} />;
    }

    if (!subscription || !subscription.hasAccess) {
        return <SubscriptionBanner type="admin" />;
    }

    const { issues, properties } = await fetchPropertiesWithStats(uid, inheritedFrom);

    // ── Derive all metrics from real data ──
    const overallSatisfaction = deriveOverallSatisfaction(issues);
    const activeAlerts = issues.filter((i) => i.status !== "resolved").length;
    const avgResponseTime = deriveAvgResponseTime(issues);
    const sentimentRisk = deriveSentimentRisk(issues);
    const criticalAlerts = deriveCriticalAlerts(issues, properties);
    const aiInsights = deriveAiInsights(issues);

    const sentimentRiskBadgeClass: Record<typeof sentimentRisk, string> = {
        low: "bg-green-50 text-green-700 border-green-200",
        medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
        high: "bg-orange-50 text-orange-700 border-orange-200",
        critical: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <div className="mt-16 sm:mt-20 lg:mt-24">
                <DashboardLayout
                    role={role}
                    uid={uid}
                    isVerified={isVerified}
                    adminId={adminId}
                    inheritedFrom={inheritedFrom}
                    isOwner={isOwner}
                >
                    <div className="space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8">

                        {/* ===== HEADER ===== */}
                        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">

                            {/* Top Row */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                                {/* Left Side */}
                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">
                                        ExperienceIQ Intelligence
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Live Data
                                        </Badge>
                                    </div>
                                </div>

                                {/* Right Side (Button) */}
                                <div className="flex justify-start sm:justify-end">
                                    <RefreshButton />
                                </div>
                            </div>

                            {/* Subtitle */}
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                                Real-time guest satisfaction insights and operational intelligence
                            </p>
                        </div>

                        {/* ===== KPI CARDS ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

                            {/* Overall Satisfaction */}
                            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold tabular-nums">
                                                {overallSatisfaction}
                                                <span className="text-lg text-muted-foreground">/5</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Overall Satisfaction
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>Based on {issues.length} issues</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Alerts */}
                            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {activeAlerts}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Active Alerts
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>
                                                    {activeAlerts === 0 ? "All clear" : "Requires attention"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Avg Response Time */}
                            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground tabular-nums">
                                                {avgResponseTime > 0 ? avgResponseTime : "—"}
                                                {avgResponseTime > 0 && (
                                                    <span className="text-lg text-muted-foreground">m</span>
                                                )}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Avg Resolution Time
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>
                                                    {avgResponseTime === 0
                                                        ? "No resolved issues yet"
                                                        : "Across resolved issues"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sentiment Risk */}
                            <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                                            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl sm:text-3xl font-display font-bold text-foreground capitalize">
                                                {sentimentRisk}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                Sentiment Risk
                                            </p>
                                            <Badge
                                                className={`mt-1 text-xs ${sentimentRiskBadgeClass[sentimentRisk]}`}
                                            >
                                                {sentimentRisk === "low"
                                                    ? "Low Risk"
                                                    : sentimentRisk === "medium"
                                                        ? "Moderate Risk"
                                                        : "High Risk"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ===== CRITICAL ALERTS & AI INSIGHTS ===== */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                            {/* Critical Guest Alerts */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 border-b">
                                    <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Critical Guest Alerts
                                    </CardTitle>
                                    <CardDescription>
                                        Open high and medium priority issues
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    {criticalAlerts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                                <BarChart3 className="w-8 h-8 text-green-600" />
                                            </div>
                                            <h3 className="text-base font-semibold mb-2">
                                                All guests are satisfied
                                            </h3>
                                            <p className="text-sm text-muted-foreground text-center">
                                                No critical alerts at this time
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {criticalAlerts.map((alert: CriticalAlertDerived) => (
                                                <div
                                                    key={alert.id}
                                                    className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200"
                                                >
                                                    {/* Row 1: Guest name + severity badge */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-semibold text-sm truncate">
                                                            {alert.guest}
                                                        </span>
                                                        <Badge
                                                            className={`shrink-0 capitalize ${severityClass(alert.severity)}`}
                                                        >
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>

                                                    {/* Row 2: Issue title */}
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.issue}
                                                    </p>

                                                    {/* Row 3: Property + room + time */}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span className="text-sm wrap-break-word">
                                                                {alert.propertyName} · {alert.propertyLocation}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            Room {alert.roomNumber}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground ml-auto">
                                                            {alert.reportedMinutesAgo}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* AI Operational Insights */}
                            <Card className="shadow-sm border-primary/40 bg-linear-to-br from-card/50 to-card/50">
                                <CardHeader className="pb-4 border-b">
                                    <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        AI Operational Insights
                                    </CardTitle>
                                    <CardDescription>
                                        Intelligent analysis of operational patterns
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-3">
                                        {aiInsights.map((insight) => (
                                            <div
                                                key={insight.id}
                                                className="flex items-start gap-3 p-3 bg-background rounded-lg border shadow-sm"
                                            >
                                                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                                                <p className="text-sm text-foreground">
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
    );
};

export default InsightsPage;