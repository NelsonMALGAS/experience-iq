import Pricing from "@/components/payment/Pricing"
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role, SubscriptionStatus } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const now = Date.now();

const Payment = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    if (!session) redirect("/");

    // 🔐 Get actual role from session claims
    const decoded = await auth?.verifySessionCookie(session, true);
    const serverRole = decoded?.role as Role || "";

    // ✅ Auth check is ONLY thing that blocks
    const verificationResult = await requireVerifiedUser(session, serverRole);
    const { subscription, isVerified, } = verificationResult;

    // 🔒 Only admins can access payment page
    if (serverRole !== "admin") {
        redirect(`/${serverRole}`);
    }

    const isExpired =
        !!subscription?.currentPeriodEnd &&
        subscription.currentPeriodEnd * 1000 < now;

    const invalidStatuses: SubscriptionStatus[] = [
        "past_due",
        "canceled",
        "incomplete",
        "unpaid",
    ];

    const needsPayment =
        !subscription ||
        subscription.hasAccess !== true ||
        !subscription.status ||
        invalidStatuses.includes(subscription.status) ||
        isExpired;

    if (!isVerified) {
        redirect(`/${serverRole}`);
    }

    if (subscription && subscription.hasAccess) redirect("/admin")
    return (
        <div className="mt-20">
            <Pricing needsPayment={needsPayment} />
        </div>
    )
}

export default Payment