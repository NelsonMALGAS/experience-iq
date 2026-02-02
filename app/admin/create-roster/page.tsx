import AdminCreateRosterPage from "@/components/CreateStaffRoster";
import { auth } from "@/db/server";
import { Role } from "@/types";
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



    if (!uid) redirect(`/login?role=${role}`)
    return (
        <div className="mt-24">
            <AdminCreateRosterPage />
        </div>
    )
}

export default RosterPage