import AdminOnboardingForm from "@/components/AdminOnboardingForm";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { auth } from "@/db/server";
import { Role } from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Admin Onboarding – ExperienceIQ",
    description:
        "Set up your organization, properties, and operational preferences. Admin onboarding helps you configure ExperienceIQ for real-time guest experience monitoring and analytics.",
    keywords: [
        ...baseKeywords,
        "admin onboarding",
        "organization setup",
        "property configuration",
        "hospitality admin",
        "platform setup",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Admin Onboarding – ExperienceIQ",
        description:
            "Configure your organization, properties, and analytics to get started with ExperienceIQ.",
        url: `${baseUrl}/onboarding/admin`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Admin Onboarding Setup",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Admin Onboarding – ExperienceIQ",
        description:
            "Configure properties, teams, and analytics to launch ExperienceIQ.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};


const AdminOnboardingPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

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

export default AdminOnboardingPage