import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Property, Role } from "@/types";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cookies } from "next/headers";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import Unverified from "@/components/Unverified";
import { Metadata } from "next";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";
import { Suspense } from "react";
import DashboardLayoutSkeleton from "@/components/layout/DashboardLayoutSkeleton";
import { PropertiesClient } from "@/components/properties/PropertiesClient";
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner";
import { isTrialExpired } from "@/lib/subscriptionAccess";

export const metadata: Metadata = {
    title: "Properties – ExperienceIQ",
    description:
        "Manage all properties and view property-specific analytics. Monitor issue resolution rates, staff performance, guest satisfaction, and operational metrics per location.",
    keywords: [
        ...baseKeywords,
        "property management",
        "properties dashboard",
        "multi-property",
        "location management",
        "property analytics",
        "hotel portfolio",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Properties Dashboard – ExperienceIQ",
        description:
            "Manage all properties and view property-specific analytics. Monitor resolution rates and guest satisfaction.",
        url: `${baseUrl}/admin/properties`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Properties Management Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Properties Dashboard – ExperienceIQ",
        description: "Manage all properties and view property-specific analytics.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};

const PropertiesPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, subscription, adminId, inheritedFrom, isOwner } = verificationResult;

    const expired = isTrialExpired(subscription);

    if (!uid) redirect(`/login?role=${role}`);

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={undefined} />;
    }

    if (!subscription || !subscription.hasAccess || expired) {
        return <SubscriptionBanner type="admin" />
    }
    // ✅ USER IS VERIFIED - Fetch properties with live statistics
    let properties: Property[] = [];
    let error: string | null = null;

    try {
        const { properties: data } = await fetchPropertiesWithStats(uid, inheritedFrom);
        properties = data;
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch properties";
        console.error("Error fetching properties:", e);
    }

    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <div className="mt-24">
                <DashboardLayout role={role} uid={uid} isVerified={isVerified} adminId={adminId} inheritedFrom={inheritedFrom} isOwner={isOwner}>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <PropertiesClient
                        uid={uid}
                        properties={properties}
                        subscription={subscription}
                    />
                </DashboardLayout>
            </div>
        </Suspense>
    );
};

export default PropertiesPage;