import LoginLayout from "@/components/login/LoginLayout";
import { roles } from "@/constants";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Role } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Sign In – ExperienceIQ",
    description:
        "Secure login and account access for ExperienceIQ staff and administrators. Manage guest issues, track service recovery, and access real-time hospitality operations dashboards.",
    keywords: [
        ...baseKeywords,
        "login",
        "sign up",
        "authentication",
        "secure login",
        "staff login",
        "admin login",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Sign In – ExperienceIQ",
        description:
            "Secure login and account access for ExperienceIQ staff and administrators. Manage guest issues, track service recovery, and access real-time hospitality dashboards.",
        url: `${baseUrl}/admin`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Sign In",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Executive Overview – ExperienceIQ",
        description:
            "Secure login and account access for ExperienceIQ staff and administrators.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

type LoginPageProps = {
    searchParams: Promise<{
        role: Role;
    }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {

    const role: Role = (await searchParams).role;



    if (!roles.includes(role)) redirect("/")

    return (
        <div className="mt-24">
            <LoginLayout role={role} />
        </div>
    )
}

export default LoginPage