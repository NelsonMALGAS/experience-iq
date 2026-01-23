
import { auth, db } from "@/db/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const AdminDashboard = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) redirect(`/login?role=${""}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${""}`)
    const uid = decoded.uid;


    const adminSnap = await db?.collection("users").doc(uid).get();
    if (!adminSnap) return redirect(`/login?role=${""}`)
    if (!adminSnap.exists) redirect(`/login?role=${""}`);
    return (
        <div className="mt-24">Overview</div>
    )
}

export default AdminDashboard