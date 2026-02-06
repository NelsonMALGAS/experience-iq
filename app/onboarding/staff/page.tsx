import AdminOnboardingForm from "@/components/AdminOnboardingForm";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { Role } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
    title: "Staff Onboarding – ExperienceIQ",
    description:
        "Onboard staff members to ExperienceIQ. Enable teams to receive, manage, and resolve guest issues efficiently with real-time updates and role-based access.",
    keywords: [
        ...baseKeywords,
        "staff onboarding",
        "hotel staff setup",
        "team access",
        "role-based access",
        "hospitality staff",
        "service operations",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Staff Onboarding – ExperienceIQ",
        description:
            "Get staff ready to manage guest issues with real-time tools and role-based access.",
        url: `${baseUrl}/onboarding/staff`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Staff Onboarding Experience",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Staff Onboarding – ExperienceIQ",
        description:
            "Onboard staff to manage guest issues efficiently in real time.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};


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