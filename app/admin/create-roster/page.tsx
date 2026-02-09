import { getStaffUsers } from "@/app/optimised-actions";
import AdminCreateRosterPage from "@/components/CreateStaffRoster";
import DashboardLayoutSkeleton from "@/components/layout/DashboardLayoutSkeleton";
import Unverified from "@/components/Unverified";
import { staffColorPalette } from "@/constants";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role, StaffMember } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;
    const userRole = role || "admin"

    if (!uid) redirect(`/login?role=${role}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={userRole} uid={uid} />
    }


    const staffUsers = await getStaffUsers();

    // Convert each UserRecord into a plain object
    const plainStaffUsers: StaffMember[] = staffUsers.map((user, index) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        color: staffColorPalette[index % staffColorPalette.length],
        department: user.department,
        role: user.role
    }));



    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <div className="mt-24">
                <AdminCreateRosterPage role={userRole} staff={plainStaffUsers} uid={uid} />
            </div>
        </Suspense>
    )
}

export default RosterPage