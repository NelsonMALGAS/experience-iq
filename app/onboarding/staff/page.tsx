import AdminOnboardingForm from "@/components/AdminOnboardingForm";
import { auth } from "@/db/server";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const StaffOnboarding = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;

    return (
        <div className="mt-24">
            <AdminOnboardingForm role={role} uid={uid} />
        </div>
    )
}

export default StaffOnboarding