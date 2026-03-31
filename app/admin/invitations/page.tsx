import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { auth, db } from "@/db/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Unverified from "@/components/Unverified";
import { Building2, Mail, Clock } from "lucide-react";
import { InvitationActionButtons } from "@/components/admins/InvitationActionButtons";
import { AcceptAllInvitationsButton } from "@/components/admins/AcceptAllInvitationsButton";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Invitations – ExperienceIQ",
    description:
        "View and manage workspace invitations. Accept invitations from other administrators to collaborate on properties within ExperienceIQ.",
    keywords: [
        ...baseKeywords,
        "workspace invitations",
        "admin invitations",
        "property collaboration",
        "team invitations",
        "property management invites",
        "admin access invitations",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Invitations – ExperienceIQ",
        description:
            "Accept or manage invitations from other administrators to collaborate on properties.",
        url: `${baseUrl}/admin/invitations`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Invitations",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Invitations – ExperienceIQ",
        description:
            "Accept invitations and collaborate with administrators across properties.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};

const InvitationsPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);
    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, adminId, inheritedFrom, isOwner } = verificationResult;

    if (!uid) redirect(`/login?role=${role}`);
    if (!canAccessData) return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={undefined} />;

    if (!db) {
        console.error("Firestore not initialized")
        return
    }

    // Fetch pending invitations for this admin
    const invitesSnapshot = await db
        .collection("adminInvitations")
        .where("invitedAdminId", "==", uid)
        .where("status", "==", "pending")
        .get();

    const invitations = invitesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            propertyId: data.propertyId,
            propertyName: data.propertyName,
            invitedByAdminId: data.invitedByAdminId,
            status: data.status,
            expiresAt: data.expiresAt?.toDate?.()?.toLocaleDateString() ?? "Unknown",
            permissions: data.permissions,
        };
    });

    // Fetch inviter display names separately — never expose their subscription
    const inviterNames: Record<string, string> = {};
    for (const inv of invitations) {
        if (!inviterNames[inv.invitedByAdminId]) {
            const inviterDoc = await db.collection("users").doc(inv.invitedByAdminId).get();
            inviterNames[inv.invitedByAdminId] = inviterDoc.data()?.displayName ?? "Property Owner";
        }
    }

    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={isVerified} adminId={adminId} inheritedFrom={inheritedFrom} isOwner={isOwner}>
                <div className="space-y-6 sm:space-y-8 px-2 sm:px-6 lg:px-8 pb-10">

                    <div className="space-y-1.5">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Invitations
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Property access invitations sent to you
                        </p>
                    </div>

                    <Separator />

                    {invitations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Mail className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold mb-1">No pending invitations</h3>
                            <p className="text-sm text-muted-foreground">
                                When a property owner invites you to manage a property, it will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* "Accept All" — only rendered when there are 2+ invitations */}
                            {invitations.length > 1 && (
                                <div className="flex justify-end">
                                    <AcceptAllInvitationsButton
                                        invitationIds={invitations.map((inv) => inv.id)}
                                        acceptingAdminUid={uid}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {invitations.map((inv) => (
                                    <Card key={inv.id} className="shadow-sm border border-border">
                                        <CardContent className="p-5 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <p className="text-sm font-semibold">{inv.propertyName}</p>
                                                    </div>
                                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs shrink-0">
                                                        Pending
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground pl-6">
                                                    Invited by {inviterNames[inv.invitedByAdminId]}
                                                </p>
                                                <div className="flex items-center gap-1.5 pl-6 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Expires {inv.expiresAt}</span>
                                                </div>
                                            </div>

                                            {/* Permissions summary */}
                                            <div className="flex flex-wrap gap-1.5 pl-6">
                                                {inv.permissions?.canManageIssues && (
                                                    <Badge variant="outline" className="text-xs">Manage Issues</Badge>
                                                )}
                                                {inv.permissions?.canViewAnalytics && (
                                                    <Badge variant="outline" className="text-xs">View Analytics</Badge>
                                                )}
                                                {inv.permissions?.canManageStaff && (
                                                    <Badge variant="outline" className="text-xs">Manage Staff</Badge>
                                                )}
                                            </div>

                                            <InvitationActionButtons
                                                invitationId={inv.id}
                                                acceptingAdminUid={uid}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </div>
    );
};

export default InvitationsPage;