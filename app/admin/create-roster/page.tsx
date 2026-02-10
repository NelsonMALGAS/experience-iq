import Unverified from "@/components/Unverified";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import RosterCreatorSkeleton from "@/components/skeletons/RosterCreatorSkeleton";
import RosterCreator from "@/components/sections/RosterCreator";


export const metadata: Metadata = {
    title: "Create Roster – ExperienceIQ",
    description:
        "Create and manage staff rosters across all properties. Assign shifts, set availability, manage time slots, and ensure optimal coverage for all locations.",
    keywords: [
        ...baseKeywords,
        "roster creation",
        "staff scheduling",
        "shift management",
        "workforce planning",
        "schedule management",
        "staff allocation",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Create Roster – ExperienceIQ",
        description:
            "Create and manage staff rosters. Assign shifts, set availability, and ensure optimal coverage.",
        url: `${baseUrl}/admin/create-roster`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Create Staff Roster",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Create Roster – ExperienceIQ",
        description: "Create and manage staff rosters. Assign shifts and ensure coverage.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}



const RosterPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;
    const userRole = role || "admin";

    if (!uid) redirect(`/login?role=${role}`);

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={userRole} uid={uid} />;
    }

    // 🚀 INSTANT shell with streaming content
    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <Suspense fallback={<RosterCreatorSkeleton />}>
                <RosterCreator uid={uid} role={userRole} />
            </Suspense>
        </div>
    );
}

export default RosterPage;