import Pricing from "@/components/payment/Pricing"
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { cookies } from "next/headers";


const Payment = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    // ✅ Auth check is ONLY thing that blocks
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, subscription } = verificationResult;

    console.log({ subscription, uid, isVerified, canAccessData }, "DATA_XXX123")
    return (
        <div className="mt-20">
            <Pricing />
        </div>
    )
}

export default Payment