
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockAdminStats, mockProperties } from "@/constants/mockData";
import { auth } from "@/db/server";
import { IssueCollection, Role } from "@/types";
import { AlertCircle, BarChart3, Building2, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchCollection } from "../actions";


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

    const allIssues = issuesCol.flatMap(doc => doc.issues);

    // const assignedIssues = allIssues.filter(i => i.assignedTo === uid)
    // const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status === 'open')
    const criticalIssues = allIssues.filter(i => i.priority === 'critical' && i.status !== 'resolved');
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
                            value={mockAdminStats.totalIssues}
                            subtitle="This month"
                            icon={BarChart3}
                            variant="primary"
                        />
                        <StatCard
                            title="Open Issues"
                            value={mockAdminStats.openIssues}
                            icon={AlertCircle}
                            variant="danger"
                        />
                        <StatCard
                            title="Avg. Resolution"
                            value={mockAdminStats.avgResolutionTime}
                            icon={Clock}
                            trend={{ value: 8, isPositive: true }}
                        />
                        <StatCard
                            title="SLA Compliance"
                            value={`${mockAdminStats.slaCompliance}%`}
                            icon={TrendingUp}
                            variant="success"
                        />
                    </div>

                    {/* Properties Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-display flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-secondary" />
                                        Properties Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {mockProperties.map((property, index) => (
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
                                                            {Math.round(((property.totalIssues - property.openIssues) / property.totalIssues) * 100)}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={((property.totalIssues - property.openIssues) / property.totalIssues) * 100}
                                                        className="h-2"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Critical Issues */}
                        <div>
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
                                            criticalIssues.map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    className="p-3 rounded-lg bg-status-open-bg border border-status-open/20"
                                                >
                                                    <p className="font-medium text-sm text-foreground line-clamp-1">
                                                        {issue.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {issue.propertyName} • {issue.roomNumber && `Room ${issue.roomNumber}`}
                                                    </p>
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
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default AdminDashboard