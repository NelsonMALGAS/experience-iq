import { IssueDetailsPageProps, Role } from "@/types"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/db/server"
import { requireVerifiedUser } from "@/lib/verificationGuards"
import Unverified from "@/components/Unverified"
import { Metadata } from "next"
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata"
import { fetchIssueById } from "@/app/optimised-actions"
import { Suspense } from "react"
import { IssueHeaderSkeleton } from "@/components/skeletons/IssueHeaderSkeleton"
import IssueContent from "@/components/sections/IssueContent"
import { IssueContentSkeleton } from "@/components/skeletons/IssueContentSkeleton"
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner"

export async function generateMetadata(
    { params }: IssueDetailsPageProps,
): Promise<Metadata> {
    const { id } = await params;

    try {
        const issue = await fetchIssueById(id)

        if (!issue) {
            return {
                ...sharedMetadata,
                title: "Issue Not Found – ExperienceIQ",
                description: "The requested issue could not be found.",
                keywords: [
                    ...baseKeywords,
                    "admin issue details",
                    "issue management",
                    "issue reassignment",
                    "administrative controls",
                    "issue analytics"
                ],
            };
        }

        const title = `${issue.title} – ExperienceIQ`;
        const description =
            issue.description ||
            "View detailed issue information. Track status, priority, and resolution progress.";

        return {
            ...sharedMetadata,
            title,
            description,
            keywords: [
                ...baseKeywords,
                "issue details",
                "issue tracking",
                "resolution notes",
                issue.category?.toLowerCase() ?? "service issue",
            ],

            openGraph: {
                title,
                description,
                url: `${baseUrl}/admin/issues/${id}`,
                siteName: "ExperienceIQ",
                images: [
                    {
                        url: "og-image.png",
                        width: 1200,
                        height: 630,
                        alt: "Issue Details and Resolution",
                    },
                ],
                locale: "en_US",
                type: "website",
            },

            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: ["/og-image.png", "/twitter-card.png"],
                creator: "@ExperienceIQ",
            },
        };
    } catch {
        return {
            ...sharedMetadata,
            title: "Issue Details – ExperienceIQ",
            description:
                "View detailed information about a guest issue and track resolution progress.",
            keywords: [...baseKeywords, "issue details"],
        };
    }
}

const IssueDetailsPage = async ({
    params,
}: IssueDetailsPageProps) => {
    const { id } = await params;

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, role: UserRole, subscription } = verificationResult;

    if (!uid) redirect(`/login?role=${role || "admin"}`);

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={undefined} />;
    }

    if (!subscription || !subscription.hasAccess) {
        return <SubscriptionBanner type="admin" />;
    }

    const goBackUrl = role === "admin" ? "/admin" : "/staff/issues";

    // 🚀 INSTANT shell renders immediately
    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl mt-16 sm:mt-20 lg:mt-24">
            {/* ✅ INSTANT: Back button renders with no await */}
            <Link href={goBackUrl}>
                <Button variant="ghost" size="sm" className="mb-4 sm:mb-6 hover:bg-muted">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Issues
                </Button>
            </Link>

            {/* 🚀 STREAMING: Content loads asynchronously */}
            <Suspense fallback={
                <div className="space-y-6">
                    <IssueHeaderSkeleton />
                    <IssueContentSkeleton />
                </div>
            }>
                <IssueContent id={id} uid={uid} role={UserRole} />
            </Suspense>
        </div>
    );
}

export default IssueDetailsPage;