import { getStaffUsers } from "@/app/actions";
import AdminCreateRosterPage from "@/components/CreateStaffRoster";
import { staffColorPalette } from "@/constants";
import { auth } from "@/db/server";
import { Role, StaffMember } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const RosterPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

    const userRole = role || "admin"

    if (!uid) redirect(`/login?role=${role}`)

    const staffUsers = await getStaffUsers();

    // Convert each UserRecord into a plain object
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
            <AdminCreateRosterPage role={userRole} staff={plainStaffUsers} uid={uid} />
        </div>
    )
}

export default RosterPage