import { requireAuth } from "@/app/actions/requireAuth";
import { redirect } from "next/navigation";


const StaffRoster = async () => {

    const { uid, role } = await requireAuth({ role: "staff" });

    if (!uid) redirect(`/login?role=${role || "staff"}`)
    return (
        <div>StaffRoster - {role}</div>
    )
}

export default StaffRoster