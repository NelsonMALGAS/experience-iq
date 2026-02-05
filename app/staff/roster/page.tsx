import { auth } from "@/db/server";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const StaffRoster = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

    if (!uid) redirect(`/login?role=${role || "staff"}`)
    return (
        <div className="mt-24">StaffRoster - {role}</div>
    )
}

export default StaffRoster