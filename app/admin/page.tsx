import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IssueCollection, Role, StaffMember } from "@/types";
import { AlertCircle, BarChart3, Building2, CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { fetchCollection, getStaffUsers } from "../actions";
import { staffColorPalette } from "@/constants";
import { aggregatePropertyStats, calculateDashboardStats } from "@/utils/dashboardUtiils";
import { IssueCard } from "@/components/issues/IssueCard";
import { cookies } from "next/headers";
import { auth } from "@/db/server";



const AdminDashboard = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

    const issuesCol = await fetchCollection<IssueCollection>("issues") || []
    const staffUsers = await getStaffUsers();

    const plainStaffUsers: StaffMember[] = staffUsers.map((user, index) => ({
        id: user.uid,
        name: user.displayName ?? user.email ?? "Unknown",
        email: user.email ?? "unknown@example.com",
        isVerified: user.emailVerified ?? false,
        color: staffColorPalette[index % staffColorPalette.length],
        department: user.customClaims?.department || "other",
    }));

    const allIssues = issuesCol.flatMap(doc => doc.issues);

    // Calculate real statistics
    const stats = calculateDashboardStats(allIssues);
    const properties = aggregatePropertyStats(allIssues);

    // Get critical and unassigned issues
    const criticalIssues = allIssues.filter(i => i.priority === 'critical' && i.status !== 'resolved');
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status !== 'resolved');
    const recentIssues = allIssues
        .filter(i => i.status !== 'resolved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    return (
        <div className="mt-24">
            <DashboardLayout role={role || "admin"} uid={uid}>
                <div className="space-y-8 animate-fade-in">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Executive Overview
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor guest experience across all properties
                        </p>
                    </div>

                    {/* Top Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard
                            title="Total Issues"
                            value={stats.totalIssues}
                            subtitle="All time"
                            icon={BarChart3}
                            variant="primary"
                        />
                        <StatCard
                            title="Open Issues"
                            value={stats.openIssues}
                            subtitle={`${stats.inProgressIssues} in progress`}
                            icon={AlertCircle}
                            variant="danger"
                        />
                        <StatCard
                            title="Avg. Resolution"
                            value={stats.avgResolutionTime}
                            subtitle={`${stats.resolvedIssues} resolved`}
                            icon={Clock}
                        />
                        <StatCard
                            title="SLA Compliance"
                            value={`${stats.slaCompliance}%`}
                            icon={TrendingUp}
                            variant={stats.slaCompliance >= 90 ? "success" : stats.slaCompliance >= 70 ? "warning" : "danger"}
                        />
                    </div>

                    {/* Properties Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-secondary" />
                                Properties Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {properties.length > 0 ? (
                                    properties.map((property, index) => (
                                        <div
                                            key={property.id}
                                            className="p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md transition-all animate-slide-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{property.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{property.location}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-status-open-bg text-status-open">
                                                        {property.openIssues} open
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Resolution Rate</span>
                                                    <span className="font-medium">
                                                        {property.totalIssues > 0
                                                            ? Math.round(((property.totalIssues - property.openIssues) / property.totalIssues) * 100)
                                                            : 0}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={property.totalIssues > 0
                                                        ? ((property.totalIssues - property.openIssues) / property.totalIssues) * 100
                                                        : 0}
                                                    className="h-2"
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No properties found
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Issues - Full Width Grid */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-secondary" />
                                    Recent Issues
                                </div>
                                <span className="text-sm font-normal text-muted-foreground">
                                    Last {recentIssues.length} active
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            {recentIssues.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recentIssues.map((issue, index) => (
                                        <div
                                            key={issue.id}
                                            className="animate-slide-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <IssueCard
                                                issue={issue}
                                                staffMembers={plainStaffUsers}
                                                currentUserId={uid}
                                                userRole={role || "admin"}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <CheckCircle2 className="h-16 w-16 mx-auto text-status-resolved mb-4" />
                                    <p className="text-lg font-medium text-foreground mb-2">All Clear!</p>
                                    <p className="text-sm text-muted-foreground">No active issues at the moment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Critical & Unassigned Issues - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Critical Issues */}
                        <Card className="border-status-open/30">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-display flex items-center gap-2 text-status-open">
                                    <AlertCircle className="h-5 w-5" />
                                    Critical Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {criticalIssues.length > 0 ? (
                                        criticalIssues.slice(0, 5).map((issue, index) => (
                                            <div
                                                key={issue.id}
                                                className="p-4 rounded-lg bg-status-open-bg border border-status-open/20 hover:border-status-open/40 transition-all hover:shadow-sm animate-slide-up"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <p className="font-medium text-sm text-foreground line-clamp-2 mb-2">
                                                    {issue.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {issue.propertyName}
                                                    {issue.roomNumber && ` • Room ${issue.roomNumber}`}
                                                </p>
                                                {issue.assignedToName && (
                                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {issue.assignedToName}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <CheckCircle2 className="h-12 w-12 mx-auto text-status-resolved mb-3" />
                                            <p className="text-sm font-medium text-foreground mb-1">All Clear</p>
                                            <p className="text-xs text-muted-foreground">No critical issues</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Unassigned Issues */}
                        <Card className="border-muted-foreground lg:col-span-2">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-display flex items-center gap-2 text-foreground">
                                    <Users className="h-5 w-5" />
                                    Unassigned Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {unassignedIssues.length > 0 ? (
                                    <>
                                        <div className="text-center py-4 mb-4 rounded-lg border bg-card">
                                            <p className="text-3xl font-bold text-primary">
                                                {unassignedIssues.length}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Awaiting assignment
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {unassignedIssues.slice(0, 3).map((issue, index) => (
                                                <div
                                                    key={issue.id}
                                                    className="p-4 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 hover:shadow-sm transition-all animate-slide-up"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <p className="font-medium text-sm text-foreground line-clamp-2 mb-2">
                                                        {issue.title}
                                                    </p>

                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">
                                                            {issue.propertyName}
                                                        </span>

                                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                                            {issue.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <CheckCircle2 className="h-12 w-12 mx-auto text-status-resolved mb-3" />
                                        <p className="text-sm font-medium text-foreground mb-1">All Assigned</p>
                                        <p className="text-xs text-muted-foreground">All issues have been assigned</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default AdminDashboard