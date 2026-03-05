import { getAdminStaff } from "@/app/optimised-actions";
import { Role } from "@/types";
import AdminCreateRosterPage from "../CreateStaffRoster";

const RosterCreator = async ({ uid, role }: { uid: string; role: Role }) => {
    const plainStaffUsers = await getAdminStaff(uid);


    return <AdminCreateRosterPage role={role} staff={plainStaffUsers} uid={uid} />;
}

export default RosterCreator