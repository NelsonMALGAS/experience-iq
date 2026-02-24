import { calculateStaffStats } from "@/utils/staffDashboardUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";

type PerformanceSectionProps = {
    uid: string
    adminId: string
}

const PerformanceSection = async ({ uid, adminId }: PerformanceSectionProps) => {

    const { issues: allIssues } = await fetchPropertiesWithStats(adminId);
    const assignedIssues = allIssues.filter(i => i.assignedTo === uid);
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status === 'open');
    const stats = calculateStaffStats(assignedIssues, unassignedIssues);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-1 bg-card border-none text-foreground">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-card flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-primary-foreground/70">SLA Compliance</p>
                            <p className="text-2xl sm:text-3xl font-display font-bold">{stats.slaCompliance}%</p>
                        </div>
                    </div>
                    <div className="space-y-2 bg-card">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-primary-foreground/70">Average Resolution</span>
                            <span className="font-semibold text-foreground/20">{stats.avgResolutionTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-foreground/70">Total Resolved</span>
                            <span className="font-semibold text-foreground/20">
                                {assignedIssues.filter(i => i.status === 'resolved').length}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="font-display text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <button className="group p-3 sm:p-5 rounded-lg bg-status-open-bg border-2 border-status-open/20 text-left hover:border-status-open/40 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-2xl sm:text-3xl font-bold text-status-open">{stats.openIssues}</p>
                                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-status-open/60 group-hover:text-status-open transition-colors" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">Unassigned Issues</p>
                            <p className="text-xs text-muted-foreground mt-1">Available to claim</p>
                        </button>
                        <button className="group p-3 sm:p-5 rounded-lg bg-status-progress-bg border-2 border-status-progress/20 text-left hover:border-status-progress/40 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-2xl sm:text-3xl font-bold text-status-progress">{stats.inProgressIssues}</p>
                                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-status-progress/60 group-hover:text-status-progress transition-colors" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">In Progress</p>
                            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default PerformanceSection