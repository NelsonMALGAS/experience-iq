import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, CheckCircle2, Users } from "lucide-react";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";

type CriticalIssuesSectionProps = {
    uid: string
    inheritedFrom: string | undefined
}

const CriticalIssuesSection = async ({ uid, inheritedFrom }: CriticalIssuesSectionProps) => {
    const { issues: allIssues } = await fetchPropertiesWithStats(uid, inheritedFrom)
    const criticalIssues = allIssues.filter(i => i.priority === 'critical' && i.status !== 'resolved');
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status !== 'resolved');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            criticalIssues.slice(0, 5).map((issue) => (
                                <div
                                    key={issue.id}
                                    className="p-4 rounded-lg bg-status-open-bg border border-status-open/20 hover:border-status-open/40 transition-all hover:shadow-sm"
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
                                {unassignedIssues.slice(0, 3).map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="p-4 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 hover:shadow-sm transition-all"
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
    );
}

export default CriticalIssuesSection