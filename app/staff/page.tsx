import { StatCard } from "@/components/dashboard/StatCard";
import IssuesList from "@/components/issues/IssuesList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth } from "@/db/server";
import { IssueCollection, Role, StaffMember } from "@/types";
import { AlertCircle, CheckCircle2, Loader2, TrendingUp, Users } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchCollection, getStaffUsers } from "../actions";
import { staffColorPalette } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStaffStats } from "@/utils/staffDashboardUtils";

const StaffDashboard = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff"

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

    const assignedIssues = allIssues.filter(i => i.assignedTo === uid)
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status === 'open')

    // Calculate real-time statistics
    const stats = calculateStaffStats(assignedIssues, unassignedIssues);

    // Combine issues for display - assigned first, then unassigned
    const displayIssues = [...assignedIssues, ...unassignedIssues];

    // Get active issues (not resolved)
    const activeIssues = displayIssues.filter(i => i.status !== 'resolved');

    return (
        <div className="mt-24">
            <DashboardLayout role={role} uid={uid}>
                <div className="space-y-8 animate-fade-in">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Staff Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and resolve guest issues efficiently
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="My Assigned"
                            value={stats.myAssigned}
                            subtitle={`${stats.inProgressIssues} in progress`}
                            icon={Users}
                            variant="primary"
                        />
                        <StatCard
                            title="Open Issues"
                            value={stats.openIssues}
                            subtitle="Needs assignment"
                            icon={AlertCircle}
                            variant="danger"
                        />
                        <StatCard
                            title="In Progress"
                            value={stats.inProgressIssues}
                            subtitle="Active work"
                            icon={Loader2}
                            variant="warning"
                        />
                        <StatCard
                            title="Resolved Today"
                            value={stats.resolvedToday}
                            icon={CheckCircle2}
                            variant="success"
                        />
                    </div>

                    {/* Performance and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Performance Card */}
                        <Card className="lg:col-span-1 bg-gradient-primary border-none text-primary-foreground">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-primary-foreground/70">SLA Compliance</p>
                                        <p className="text-3xl font-display font-bold">{stats.slaCompliance}%</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-primary-foreground/70">Average Resolution</span>
                                        <span className="font-semibold text-primary-foreground">
                                            {stats.avgResolutionTime}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-primary-foreground/70">Total Resolved</span>
                                        <span className="font-semibold text-primary-foreground">
                                            {assignedIssues.filter(i => i.status === 'resolved').length}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="font-display">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="group p-5 rounded-lg bg-status-open-bg border-2 border-status-open/20 text-left hover:border-status-open/40 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-3xl font-bold text-status-open">{stats.openIssues}</p>
                                            <AlertCircle className="h-6 w-6 text-status-open/60 group-hover:text-status-open transition-colors" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">Unassigned Issues</p>
                                        <p className="text-xs text-muted-foreground mt-1">Available to claim</p>
                                    </button>
                                    <button className="group p-5 rounded-lg bg-status-progress-bg border-2 border-status-progress/20 text-left hover:border-status-progress/40 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-3xl font-bold text-status-progress">{stats.inProgressIssues}</p>
                                            <Loader2 className="h-6 w-6 text-status-progress/60 group-hover:text-status-progress transition-colors" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">In Progress</p>
                                        <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Issues Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground">
                                    My Active Issues
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {activeIssues.length > 0
                                        ? `${activeIssues.length} issue${activeIssues.length === 1 ? '' : 's'} requiring attention`
                                        : 'All caught up!'}
                                </p>
                            </div>
                            {activeIssues.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                                        <span>Assigned</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-muted border-2 border-border" />
                                        <span>Unassigned</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {displayIssues.length > 0 ? (
                            <IssuesList
                                issues={displayIssues}
                                staffMembers={plainStaffUsers}
                                currentUserId={uid}
                                userRole={role}
                            />
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <CheckCircle2 className="h-16 w-16 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No Issues Found
                                    </h3>
                                    <p className="text-sm text-muted-foreground text-center max-w-md">
                                        You don&apos;t have any assigned issues and there are no open issues available.
                                        Great job staying on top of things!
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default StaffDashboard