import { fetchCollection, getStaffUsers } from "@/app/actions";
import StaffIssues from "@/components/issues/StaffIssues"
import { staffColorPalette } from "@/constants";
import { auth } from "@/db/server";
import { IssueCollection, Role, StaffMember } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const StaffIssuesPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

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
            <StaffIssues role={role} uid={uid} issues={allIssues} staff={plainStaffUsers} />
        </div>
    )
}

export default StaffIssuesPage