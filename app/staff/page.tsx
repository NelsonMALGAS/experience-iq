import { StatCard } from "@/components/dashboard/StatCard";
import IssuesList from "@/components/issues/IssuesList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockStaffStats } from "@/constants/mockData";
import { auth } from "@/db/server";
import { IssueCollection, Role } from "@/types";
import { AlertCircle, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchCollection } from "../actions";


const StaffDashboard = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

    console.log(decoded, "DECODED")
    const issuesCol = await fetchCollection<IssueCollection>("issues") || []

    const allIssues = issuesCol.flatMap(doc => doc.issues);

    const assignedIssues = allIssues.filter(i => i.assignedTo === uid)
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status === 'open')

    if (!uid) redirect(`/login?role=${role}`)
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
                            value={mockStaffStats.totalIssues}
                            icon={AlertCircle}
                            variant="primary"
                        />
                        <StatCard
                            title="Open Issues"
                            value={mockStaffStats.openIssues}
                            subtitle="Needs attention"
                            icon={AlertCircle}
                            variant="danger"
                        />
                        <StatCard
                            title="In Progress"
                            value={mockStaffStats.inProgressIssues}
                            icon={Loader2}
                            variant="warning"
                        />
                        <StatCard
                            title="Resolved Today"
                            value={mockStaffStats.resolvedIssues}
                            icon={CheckCircle2}
                            trend={{ value: 12, isPositive: true }}
                            variant="success"
                        />
                    </div>

                    {/* Performance Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1 bg-gradient-primary rounded-xl p-6 text-primary-foreground">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-primary-foreground/70">SLA Compliance</p>
                                    <p className="text-3xl font-display font-bold">{mockStaffStats.slaCompliance}%</p>
                                </div>
                            </div>
                            <p className="text-sm text-primary-foreground/70">
                                Average resolution time: <span className="font-semibold text-primary-foreground">{mockStaffStats.avgResolutionTime}</span>
                            </p>
                        </div>

                        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                            <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-lg bg-status-open-bg border border-status-open/20 text-left hover:shadow-md transition-all">
                                    <p className="text-2xl font-bold text-status-open">{mockStaffStats.openIssues}</p>
                                    <p className="text-sm text-muted-foreground">Unassigned Issues</p>
                                </button>
                                <button className="p-4 rounded-lg bg-status-progress-bg border border-status-progress/20 text-left hover:shadow-md transition-all">
                                    <p className="text-2xl font-bold text-status-progress">{mockStaffStats.inProgressIssues}</p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Issues */}
                    <div>
                        <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                            My Active Issues
                        </h2>
                        <IssuesList issues={[...assignedIssues, ...unassignedIssues]} />
                    </div>
                </div>
            </DashboardLayout>

        </div>
    )
}

export default StaffDashboard