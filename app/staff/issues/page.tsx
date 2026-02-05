import { fetchCollection, getStaffUsers } from "@/app/actions";
import { requireAuth } from "@/app/actions/requireAuth";
import StaffIssues from "@/components/issues/StaffIssues"
import { staffColorPalette } from "@/constants";
import { IssueCollection, StaffMember } from "@/types";
import { redirect } from "next/navigation";


const StaffIssuesPage = async () => {

    const { uid, role } = await requireAuth({ role: "staff" });

    if (!uid) redirect(`/login?role=${role || "staff"}`)

    const issuesCol = await fetchCollection<IssueCollection>("issues") || []

    const allIssues = issuesCol.flatMap(doc => doc.issues);

    const staffUsers = await getStaffUsers();

    const plainStaffUsers: StaffMember[] = staffUsers.map((user, index) => ({
        id: user.uid,
        name: user.displayName ?? user.email ?? "Unknown",
        email: user.email ?? "unknown@example.com",
        isVerified: user.emailVerified ?? false,
        color: staffColorPalette[index % staffColorPalette.length],
        department: user.customClaims?.department || "other",
    }));
    return (
        <div className="mt-24">
            <StaffIssues role={role || "staff"} uid={uid} issues={allIssues} staff={plainStaffUsers} />
        </div>
    )
}

export default StaffIssuesPage