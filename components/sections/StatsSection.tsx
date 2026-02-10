import { fetchAllIssues } from "@/app/optimised-actions";
import { calculateDashboardStats } from "@/utils/dashboardUtiils";
import { StatCard } from "../dashboard/StatCard";
import { AlertCircle, BarChart3, Clock, TrendingUp } from "lucide-react";

const StatsSection = async () => {
    const allIssues = await fetchAllIssues()

    const stats = calculateDashboardStats(allIssues);

    return (
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
    );
}

export default StatsSection