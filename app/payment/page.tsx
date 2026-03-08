import Pricing from "@/components/payment/Pricing";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role, SubscriptionStatus } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Billing & Subscription – ExperienceIQ",
    description:
        "Manage your ExperienceIQ subscription, view billing details, upgrade your plan, and track payment history securely in one place.",
    keywords: [
        ...baseKeywords,
        "billing",
        "subscription management",
        "payment",
        "pricing plans",
        "upgrade plan",
        "invoice history",
        "account billing",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Billing & Subscription – ExperienceIQ",
        description:
            "Manage your subscription, update billing details, and upgrade your plan securely.",
        url: `${baseUrl}/payment`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Billing & Subscription Page",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Billing & Subscription – ExperienceIQ",
        description:
            "Manage your subscription and billing securely with ExperienceIQ.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};

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
    const { subscription, isVerified, uid } = verificationResult;

    // 🔒 Only admins can access payment page
    if (serverRole !== "admin") {
        redirect(`/${serverRole}`);
    }

    const isExpired =
        !!subscription?.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd).getTime() < now;

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
            <Pricing needsPayment={needsPayment} uid={uid} />
        </div>
    )
}

export default Payment