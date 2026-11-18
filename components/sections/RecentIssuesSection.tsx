import { getStaffUsers } from "@/app/optimised-actions";
import { Role } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";
import RecentIssuesList from "./RecentIssuesList";

type RecentIssuesSectionProps = {
    uid: string;
    role: Role,
    inheritedFrom: string | undefined
    adminType: "main" | "inherited" | undefined
    adminId: string | null | undefined
}

const RecentIssuesSection = async ({ uid, role, inheritedFrom, adminType, adminId }: RecentIssuesSectionProps) => {
    const [data, staffUsers] = await Promise.all([
        fetchPropertiesWithStats(uid, inheritedFrom),
        getStaffUsers()
    ]);

    const allIssues = data.issues


    const recentIssues = allIssues
        .filter(i => i.status !== 'resolved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    return (
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
                    <RecentIssuesList
                        issues={recentIssues}
                        currentUserId={uid}
                        staffMembers={staffUsers}
                        adminType={adminType}
                        userRole={role}
                        adminId={adminId}
                    />
                ) : (
                    <div className="text-center py-16">
                        <CheckCircle2 className="h-16 w-16 mx-auto text-status-resolved mb-4" />
                        <p className="text-lg font-medium text-foreground mb-2">All Clear!</p>
                        <p className="text-sm text-muted-foreground">No active issues at the moment</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default RecentIssuesSection