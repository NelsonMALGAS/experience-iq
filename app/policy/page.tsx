import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
    title: "Refund & Cancellation Policy – ExperienceIQ",
    description:
        "Learn about ExperienceIQ's refund and cancellation policies. Understand how we handle disputes, cancellations, and provide support for clients.",
    keywords: [
        ...baseKeywords,
        "refund policy",
        "cancellation policy",
        "SaaS terms",
        "customer support",
        "ExperienceIQ",
        "dispute handling",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Refund & Cancellation Policy – ExperienceIQ",
        description:
            "Understand ExperienceIQ's refund and cancellation policy. Clear guidance for clients on disputes and support.",
        url: `${baseUrl}/policy`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image-policy.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Refund & Cancellation Policy",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Refund & Cancellation Policy – ExperienceIQ",
        description: "Detailed refund, cancellation, and dispute handling policy for ExperienceIQ clients.",
        images: ["/og-image-policy.png"],
        creator: "@ExperienceIQ",
    },
};

const PolicyPage = () => {
    return (
        <main className="container mx-auto px-3 sm:px-6 py-16 sm:py-24 max-w-4xl">

            {/* Back Button */}
            <div className="mb-5 sm:mb-6">
                <BackButton label="Go back" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-center mb-8 sm:mb-12 tracking-tight">
                Refund & Cancellation Policy
            </h1>

            <div className="space-y-5 sm:space-y-8">
                {/* Intro */}
                <Card className="bg-primary/5 border border-primary/20">
                    <CardContent className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            At <span className="font-semibold">ExperienceIQ</span>, we aim to provide a seamless experience for our clients. If you are unhappy with our service, please follow the guidelines below. Our policies are designed to be transparent, fair, and client-focused.
                        </p>
                    </CardContent>
                </Card>

                {/* Refunds */}
                <Card className="border">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
                        <CardTitle className="text-xl sm:text-2xl font-semibold">Refunds</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Full refunds are available within 7 days of subscription purchase.</li>
                            <li>After 7 days, partial refunds may be considered on a case-by-case basis.</li>
                            <li>No refunds are available after 30 days of subscription usage.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Cancellations */}
                <Card className="border">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
                        <CardTitle className="text-xl sm:text-2xl font-semibold">Cancellations</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li>
                                To cancel your subscription, please contact our support team at{" "}
                                <Link
                                    href="mailto:experienceiq.helpdesk@gmail.com"
                                    className="text-primary underline hover:text-primary/80 transition-colors break-all"
                                >
                                    experienceiq.helpdesk@gmail.com
                                </Link>
                                .
                            </li>
                            <li>Access will continue until the end of the current billing period once cancellation is confirmed.</li>
                            <li>No refunds are issued for cancelled subscriptions beyond the initial refund period.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Dispute Handling */}
                <Card className="border">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
                        <CardTitle className="text-xl sm:text-2xl font-semibold">Dispute Handling</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            If a client is unhappy or requests a refund, please contact our support team at{" "}
                            <Link
                                href="mailto:experienceiq.helpdesk@gmail.com"
                                className="text-primary underline hover:text-primary/80 transition-colors break-all"
                            >
                                experienceiq.helpdesk@gmail.com
                            </Link>
                            . We review disputes fairly and aim to resolve them promptly, providing refunds or alternatives where applicable.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
};

export default PolicyPage;