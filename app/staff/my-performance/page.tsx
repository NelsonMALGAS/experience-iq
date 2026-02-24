import { getStaffPerformance } from "@/app/optimised-actions";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardLayoutSkeleton from "@/components/layout/DashboardLayoutSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Unverified from "@/components/Unverified";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { Activity, AlertCircle, CheckCircle2, Clock, Target, TrendingUp } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";



export const metadata: Metadata = {
    title: "Performance – ExperienceIQ",
    description: "Track your property performance, monitor issue resolution, and measure staff efficiency across all locations.",
    keywords: [
        ...baseKeywords,
        "property management",
        "properties dashboard",
        "multi-property",
        "location management",
        "property analytics",
        "hotel portfolio",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Properties Dashboard – ExperienceIQ",
        description: "Analyze staff performance, monitor resolution rates, and track staff efficiency.",
        url: `${baseUrl}/staff/my-performance`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Properties Management Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Properties Dashboard – ExperienceIQ",
        description: "Analyze staff performance, monitor resolution rates, and track staff efficiency.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}
const MyPerformance = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, adminId } = verificationResult;

    if (!uid) redirect(`/login?role=${role}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} />
    }

    const performance = await getStaffPerformance(uid)

    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <div className="mt-24 space-y-4">
                <DashboardLayout isVerified={isVerified} role={role} uid={uid} adminId={adminId}>
                    {/* Header */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            My Performance
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Overview of your assigned issues, resolution efficiency, and SLA compliance.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 my-4">
                        {/* Total Assigned */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Assigned
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.totalAssigned}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total issues
                                </p>
                            </CardContent>
                        </Card>

                        {/* Resolved */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Resolved
                                </CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.resolved}
                                </div>
                                <Badge variant="secondary" className="mt-1">
                                    Completed
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* In Progress */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    In Progress
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.inProgress}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Being worked on
                                </p>
                            </CardContent>
                        </Card>

                        {/* Open */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Open
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.open}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting action
                                </p>
                            </CardContent>
                        </Card>

                        {/* Avg Resolution Time */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Resolution
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.avgResolutionTime}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per issue
                                </p>
                            </CardContent>
                        </Card>

                        {/* Resolution Rate */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Resolution Rate
                                </CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {performance?.resolutionRate}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Issues resolved
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* SLA Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                SLA Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="text-2xl font-bold">
                                {performance?.slaCompliance}%
                            </div>
                            <Badge
                                variant={(performance?.slaCompliance || 0) > 0 ? "secondary" : "outline"}
                            >
                                {(performance?.slaCompliance || 0) > 0
                                    ? "Within SLA"
                                    : "No SLA met yet"}
                            </Badge>
                        </CardContent>
                    </Card>
                </DashboardLayout>
            </div>
        </Suspense>

    )
}

export default MyPerformance