import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/db/server";
import { IssueCollection, Role, StaffMember } from "@/types";
import { AlertCircle, BarChart3, Building2, CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchCollection, getStaffUsers } from "../actions";
import { staffColorPalette } from "@/constants";
import { aggregatePropertyStats, calculateDashboardStats } from "@/utils/dashboardUtiils";
import { IssueCard } from "@/components/issues/IssueCard";



const AdminDashboard = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

    if (!uid) redirect(`/login?role=${role}`)

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
            <DashboardLayout role={role} uid={uid}>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Properties Overview - 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Properties Card */}
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

                            {/* Recent Issues */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-display flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-secondary" />
                                            Recent Issues
                                        </div>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            Last 10 active
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentIssues.length > 0 ? (
                                            recentIssues.map((issue) => (
                                                <IssueCard
                                                    key={issue.id}
                                                    issue={issue}
                                                    staffMembers={plainStaffUsers}
                                                    currentUserId={uid}
                                                    userRole={role}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <CheckCircle2 className="h-12 w-12 mx-auto text-status-resolved mb-2" />
                                                <p className="text-sm text-muted-foreground">No active issues</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - 1 column */}
                        <div className="space-y-6">
                            {/* Critical Issues */}
                            <Card className="border-status-open/30">
                                <CardHeader className="pb-3">
                                    <CardTitle className="font-display flex items-center gap-2 text-status-open">
                                        <AlertCircle className="h-5 w-5" />
                                        Critical Issues
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {criticalIssues.length > 0 ? (
                                            criticalIssues.slice(0, 5).map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    className="p-3 rounded-lg bg-status-open-bg border border-status-open/20 hover:border-status-open/40 transition-colors"
                                                >
                                                    <p className="font-medium text-sm text-foreground line-clamp-2">
                                                        {issue.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {issue.propertyName} • {issue.roomNumber && `Room ${issue.roomNumber}`}
                                                    </p>
                                                    {issue.assignedToName && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {issue.assignedToName}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6">
                                                <CheckCircle2 className="h-10 w-10 mx-auto text-status-resolved mb-2" />
                                                <p className="text-sm text-muted-foreground">No critical issues</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Unassigned Issues */}
                            <Card className="border-orange-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="font-display flex items-center gap-2 text-orange-600">
                                        <Users className="h-5 w-5" />
                                        Unassigned
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {unassignedIssues.length > 0 ? (
                                            <>
                                                <div className="text-center py-2 mb-2 bg-orange-50 rounded-lg border border-orange-200">
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        {unassignedIssues.length}
                                                    </p>
                                                    <p className="text-xs text-orange-600/80">
                                                        Awaiting assignment
                                                    </p>
                                                </div>
                                                {unassignedIssues.slice(0, 3).map((issue) => (
                                                    <div
                                                        key={issue.id}
                                                        className="p-3 rounded-lg bg-orange-50 border border-orange-200 hover:border-orange-300 transition-colors"
                                                    >
                                                        <p className="font-medium text-sm text-foreground line-clamp-2">
                                                            {issue.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {issue.propertyName}
                                                        </p>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="text-center py-6">
                                                <CheckCircle2 className="h-10 w-10 mx-auto text-status-resolved mb-2" />
                                                <p className="text-sm text-muted-foreground">All issues assigned</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default AdminDashboard