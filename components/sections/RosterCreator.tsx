import { getStaffUsers } from "@/app/optimised-actions";
import { staffColorPalette } from "@/lib/optimise-helpers";
import { Role, StaffMember } from "@/types";
import AdminCreateRosterPage from "../CreateStaffRoster";

const RosterCreator = async ({ uid, role }: { uid: string; role: Role }) => {
    const staffUsers = await getStaffUsers();

    const plainStaffUsers: StaffMember[] = staffUsers.map((user, index) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        color: staffColorPalette[index % staffColorPalette.length],
        department: user.department,
        role: user.role
    }));

    return <AdminCreateRosterPage role={role} staff={plainStaffUsers} uid={uid} />;
}

export default RosterCreator