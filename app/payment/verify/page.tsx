import LoadingState from "@/components/LoadingState";
import PaymentVerifyContent from "@/components/payment/PaymentVerifyContent";
import { baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";
import { Suspense } from "react";


export const metadata: Metadata = {
    title: "Payment Verification – ExperienceIQ",
    description:
        "Securely verifying your payment. Please wait while we confirm your subscription status.",
    robots: {
        index: false,
        follow: false,
    },
    ...sharedMetadata,
    openGraph: {
        title: "Payment Verification – ExperienceIQ",
        description:
            "Securely verifying your payment and activating your subscription.",
        url: `${baseUrl}/payment/verify`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Payment Verification",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Payment Verification – ExperienceIQ",
        description:
            "Verifying your payment securely with ExperienceIQ.",
        images: ["/og-image.png"],
        creator: "@ExperienceIQ",
    },
};

const PaymentVerifyPage = () => {
    return (
        <Suspense fallback={<LoadingState message="Verifying Payment..." />}>
            <PaymentVerifyContent />
        </Suspense>
    );
}

export default PaymentVerifyPage