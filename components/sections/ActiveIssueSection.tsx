import { fetchStaffIssues, getStaffUsers } from "@/app/optimised-actions";
import { staffColorPalette } from "@/lib/optimise-helpers";
import { Role, StaffMember } from "@/types";
import IssuesList from "../issues/IssuesList";
import { Card, CardContent } from "../ui/card";
import { CheckCircle2 } from "lucide-react";

const ActiveIssuesSection = async ({ uid, role }: { uid: string; role: Role }) => {
    const [allIssues, staffUsers] = await Promise.all([
        fetchStaffIssues(uid),
        getStaffUsers()
    ]);

    const plainStaffUsers: StaffMember[] = staffUsers.map((user, index) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        color: staffColorPalette[index % staffColorPalette.length],
        department: user.department,
        role: user.role
    }));

    const assignedIssues = allIssues.filter(i => i.assignedTo === uid);
    const unassignedIssues = allIssues.filter(i => !i.assignedTo && i.status === 'open');
    const displayIssues = [...assignedIssues, ...unassignedIssues];
    const activeIssues = displayIssues.filter(i => i.status !== 'resolved');

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                        My Active Issues
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {activeIssues.length > 0
                            ? `${activeIssues.length} issue${activeIssues.length === 1 ? '' : 's'} requiring attention`
                            : 'All caught up!'}
                    </p>
                </div>
                {activeIssues.length > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/20 border-2 border-primary" />
                            <span>Assigned</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-muted border-2 border-border" />
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
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                        <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                            No Issues Found
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md px-4">
                            You don&apos;t have any assigned issues and there are no open issues available.
                            Great job staying on top of things!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default ActiveIssuesSection