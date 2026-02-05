import { getStaffUsers } from "@/app/actions";
import { requireAuth } from "@/app/actions/requireAuth"
import AdminCreateRosterPage from "@/components/CreateStaffRoster";
import { staffColorPalette } from "@/constants";
import { StaffMember } from "@/types";
import { redirect } from "next/navigation";


const RosterPage = async () => {

    const { role, uid } = await requireAuth({ role: "admin" });

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