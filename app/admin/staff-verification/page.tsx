// app/admin/staff-verification/page.tsx
// Server Component — no "use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { auth } from "@/db/server";
import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Unverified from "@/components/Unverified";
import { StaffCard } from "@/components/staff/StaffCard";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { CheckCircle2, Clock, Users } from "lucide-react";
import { getAdminStaff, getUnverifiedAdminStaff } from "@/app/optimised-actions";
import { EmptyState, SectionHeader } from "@/components/staff/Verification";
import { RefreshButton } from "@/components/layout/RefreshButton";



export const metadata: Metadata = {
    title: "Staff Verification – ExperienceIQ",
    description:
        "Verify or revoke verification for staff members across your properties. Maintain trusted teams and ensure only authorized staff access operational tools.",
    keywords: [
        ...baseKeywords,
        "staff verification",
        "staff management",
        "staff permissions",
        "property staff",
        "admin tools",
        "team verification",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Staff Verification – ExperienceIQ",
        description:
            "Verify and manage staff members across your properties to maintain a trusted operational team.",
        url: `${baseUrl}/admin/staff-verification`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Staff Verification",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Staff Verification – ExperienceIQ",
        description:
            "Verify and manage staff members across your properties.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};


const StaffVerificationPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, adminId, inheritedFrom } = verificationResult;

    if (!uid) redirect(`/login?role=${role}`);

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} />;
    }

    // ── Fetch both lists in parallel ─────────────────────────────────────────
    const [verifiedStaff, unverifiedStaff] = await Promise.all([
        getAdminStaff(uid),
        getUnverifiedAdminStaff(uid),
    ]);

    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={isVerified} adminId={adminId} inheritedFrom={inheritedFrom}>
                <div className="space-y-6 sm:space-y-8 px-2 sm:px-6 lg:px-8 pb-10">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        {/* Title + description */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                                    Staff Verification
                                </h1>
                            </div>

                            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                                Verify staff members before they can access the platform
                            </p>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex sm:items-center">
                            <RefreshButton />
                        </div>

                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            {
                                icon: Users,
                                label: "Total Staff",
                                value: verifiedStaff.length + unverifiedStaff.length,
                                color: "text-blue-600 dark:text-blue-400",
                                bg: "bg-blue-100 dark:bg-blue-900/30",
                            },
                            {
                                icon: Clock,
                                label: "Awaiting Verification",
                                value: unverifiedStaff.length,
                                color: "text-yellow-600 dark:text-yellow-400",
                                bg: "bg-yellow-100 dark:bg-yellow-900/30",
                            },
                            {
                                icon: CheckCircle2,
                                label: "Verified",
                                value: verifiedStaff.length,
                                color: "text-green-600 dark:text-green-400",
                                bg: "bg-green-100 dark:bg-green-900/30",
                            },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm"
                            >
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-bold tabular-nums text-foreground leading-none">
                                        {value}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <SectionHeader
                                title="Awaiting Verification"
                                count={unverifiedStaff.length}
                                variant="pending"
                            />
                        </div>
                        <Separator />

                        {unverifiedStaff.length === 0 ? (
                            <EmptyState
                                message="No staff awaiting verification"
                                icon={Clock}
                            />
                        ) : (
                            <ScrollArea className="h-auto max-h-120 pr-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {unverifiedStaff.map((staff) => (
                                        <StaffCard key={staff.id} staff={staff} />
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <SectionHeader
                                title="Verified Staff"
                                count={verifiedStaff.length}
                                variant="verified"
                            />
                        </div>
                        <Separator />

                        {verifiedStaff.length === 0 ? (
                            <EmptyState
                                message="No verified staff yet"
                                icon={CheckCircle2}
                            />
                        ) : (
                            <ScrollArea className="h-auto max-h-120 pr-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {verifiedStaff.map((staff) => (
                                        <StaffCard key={staff.id} staff={staff} />
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Bottom spacing */}
                    <div className="h-4 sm:h-0" />
                </div>
            </DashboardLayout>
        </div>
    );
};

export default StaffVerificationPage;