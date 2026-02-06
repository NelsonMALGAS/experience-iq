import { fetchCollection, getStaffUsers } from "@/app/actions";
import StaffIssues from "@/components/issues/StaffIssues"
import Unverified from "@/components/Unverified";
import { staffColorPalette } from "@/constants";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { IssueCollection, Role, StaffMember } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Assigned Issues – ExperienceIQ",
    description:
        "Manage and resolve assigned guest issues efficiently. View issue details, update status, add notes, and track time to resolution for all assigned service requests.",
    keywords: [
        ...baseKeywords,
        "assigned issues",
        "issue resolution",
        "task management",
        "service tickets",
        "staff tasks",
        "issue tracking",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Assigned Issues – ExperienceIQ",
        description:
            "Manage and resolve assigned guest issues efficiently. View details, update status, and track time to resolution.",
        url: `${baseUrl}/staff/issues`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Staff Assigned Issues Management",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Assigned Issues – ExperienceIQ",
        description:
            "Manage and resolve assigned guest issues efficiently. Track time to resolution.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

const StaffIssuesPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "staff"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;

    if (!uid) redirect(`/login?role=${role || "staff"}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} />
    }

    const issuesCol = await fetchCollection<IssueCollection>("issues") || []

    const allIssues = issuesCol.flatMap(doc => doc.issues);

    const staffUsers = await getStaffUsers();

    const plainStaffUsers: StaffMember[] = staffUsers.map((user, index) => ({
        id: user.uid,
        name: user.displayName ?? user.email ?? "Unknown",
        email: user.email ?? "unknown@example.com",
        isVerified: user.emailVerified ?? false,
        color: staffColorPalette[index % staffColorPalette.length],
        department: user.customClaims?.department || "other",
    }));
    return (
        <div className="mt-24">
            <StaffIssues role={role || "staff"} uid={uid} issues={allIssues} staff={plainStaffUsers} isVerified={isVerified} />
        </div>
    )
}

export default StaffIssuesPage