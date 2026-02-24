import { calculateStaffStats } from "@/utils/staffDashboardUtils";
import { StatCard } from "../dashboard/StatCard";
import { AlertCircle, CheckCircle2, Loader2, Users } from "lucide-react";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";

type StatsSectionProps = {
    uid: string
    adminId: string
}

const StatsSection = async ({ uid, adminId }: StatsSectionProps) => {

    const { issues: allIssues } = await fetchPropertiesWithStats(adminId)

    const assignedIssues = allIssues.filter(i => i.assignedTo === uid);
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status === 'open');
    const stats = calculateStaffStats(assignedIssues, unassignedIssues);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
    );
}

export default StatsSection