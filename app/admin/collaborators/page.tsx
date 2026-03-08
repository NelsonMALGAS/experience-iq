
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { auth } from "@/db/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Unverified from "@/components/Unverified";
import { SubscriptionBanner } from "@/components/payment/SubscriptionBanner";
import { db } from "@/db/server";
import { Users, UserCheck, ShieldAlert, Mail } from "lucide-react";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";
import { fetchEligibleAdmins } from "@/app/admin-invite-actions";
import { InviteAdminForm } from "@/components/admins/InviteAdminForm";
import { RevokeAccessButton } from "@/components/admins/RevokeAccessButton";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Collaborators – ExperienceIQ",
    description:
        "Manage property collaborators and administrators. Control access, roles, and permissions for team members across your properties.",
    keywords: [
        ...baseKeywords,
        "collaborators",
        "team management",
        "property admins",
        "staff access control",
        "workspace collaboration",
        "property management team",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Collaborators – ExperienceIQ",
        description:
            "Manage administrators and collaborators who help operate your properties.",
        url: `${baseUrl}/admin/collaborators`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Collaborators Management",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Collaborators – ExperienceIQ",
        description:
            "Manage property administrators and collaborators across your workspace.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};

interface PendingInvite {
    id: string;
    invitedAdminEmail: string;
    propertyName: string;
    expiresAt: Date;
}

function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}


const CollaboratorsPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, subscription, adminId, adminType, inheritedFrom, isOwner } = verificationResult;

    if (!uid) redirect(`/login?role=${role}`);
    if (!canAccessData) return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={isOwner} />;
    if (!subscription?.hasAccess && !inheritedFrom) return <SubscriptionBanner type="admin" />;

    if (!db) {
        console.error("[CollaboratorsPage] Firestore not initialized");
        return null;
    }

    if (adminType === "inherited" || inheritedFrom) {
        redirect("/admin"); // Inherited admins cannot manage collaborators
    }


    // ── Fetch data in parallel ────────────────────────────────────────────
    const [eligibleAdmins, { properties }, activeAccessSnapshot] = await Promise.all([
        fetchEligibleAdmins(uid),
        fetchPropertiesWithStats(uid, inheritedFrom),
        db.collection("propertyAccess")
            .where("propertyOwnerId", "==", uid)
            .where("status", "==", "active")
            .get(),
    ]);


    // Filter out any undefined entries (defensive — Promise.all map is always defined here)
    const activeCollaborators = (await Promise.all(
        activeAccessSnapshot.docs.map(async (doc) => {
            const access = doc.data();

            if (!db) {
                console.error("[CollaboratorsPage] Firestore not initialized");
                return null;
            }
            const collaboratorDoc = await db.collection("users").doc(access.grantedToAdminId).get();
            const collaborator = collaboratorDoc.data();
            const property = properties.find(p => p.id === access.propertyId);
            return {
                accessId: doc.id,
                adminId: access.grantedToAdminId,
                displayName: collaborator?.displayName ?? "Unknown",
                email: collaborator?.email ?? "",
                propertyId: access.propertyId,
                propertyName: property?.name ?? "Unknown Property",
                permissions: access.permissions,
                grantedAt: access.grantedAt?.toDate?.() ?? new Date(),
            };
        })
    )).filter((c): c is NonNullable<typeof c> => c !== undefined && c !== null);

    // Pending invitations
    const pendingInvitesSnapshot = await db
        .collection("adminInvitations")
        .where("invitedByAdminId", "==", uid)
        .where("status", "==", "pending")
        .get();

    const pendingInvites: PendingInvite[] = pendingInvitesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            invitedAdminEmail: data.invitedAdminEmail ?? "",
            propertyName: data.propertyName ?? "",
            expiresAt: data.expiresAt?.toDate?.() ?? new Date(),
        };
    });

    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={isVerified} adminId={adminId} inheritedFrom={inheritedFrom} isOwner={isOwner}>
                <div className="space-y-6 sm:space-y-8 px-2 sm:px-6 lg:px-8 pb-10">

                    {/* ── Header ───────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                            Collaborators
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Invite verified admins to help manage your properties
                        </p>
                    </div>

                    {/* ── Summary Strip ────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { icon: Users, label: "Active Collaborators", value: activeCollaborators.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
                            { icon: Mail, label: "Pending Invitations", value: pendingInvites.length, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
                            { icon: UserCheck, label: "Eligible to Invite", value: eligibleAdmins.length, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm">
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-bold tabular-nums text-foreground leading-none">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Invite Form ───────────────────────────────────── */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserCheck className="h-5 w-5 text-primary" />
                                Invite a Collaborator
                            </CardTitle>
                            <CardDescription>
                                Only verified admins without an active subscription can be invited.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {eligibleAdmins.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <Users className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1">No eligible admins</p>
                                    <p className="text-xs text-muted-foreground max-w-xs">
                                        Admins must be verified and must not have their own subscription or properties to be eligible.
                                    </p>
                                </div>
                            ) : (
                                <InviteAdminForm
                                    eligibleAdmins={eligibleAdmins}
                                    properties={properties}
                                    inviterUid={uid}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Active Collaborators ──────────────────────────── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">Active Collaborators</h2>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">{activeCollaborators.length}</Badge>
                        </div>
                        <Separator />

                        {activeCollaborators.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <UserCheck className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No active collaborators yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {activeCollaborators.map((collab) => (
                                    <Card key={collab.accessId} className="shadow-sm border border-border">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-9 w-9 shrink-0 border border-border">
                                                    <AvatarFallback className="text-xs font-semibold bg-muted">
                                                        {getInitials(collab.displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="text-sm font-semibold truncate">{collab.displayName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{collab.email}</p>
                                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                        <Badge variant="outline" className="text-xs">{collab.propertyName}</Badge>
                                                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground">
                                                    Since {collab.grantedAt.toLocaleDateString()}
                                                </p>
                                                <RevokeAccessButton
                                                    accessId={collab.accessId}
                                                    revokerUid={uid}
                                                    adminName={collab.displayName}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Pending Invitations ───────────────────────────── */}
                    {pendingInvites.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-base sm:text-lg font-semibold text-foreground">Pending Invitations</h2>
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{pendingInvites.length}</Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {pendingInvites.map((invite: PendingInvite) => (
                                    <Card key={invite.id} className="shadow-sm border-yellow-200/50 dark:border-yellow-900/30">
                                        <CardContent className="p-4 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{invite.invitedAdminEmail}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{invite.propertyName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Expires {invite.expiresAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 shrink-0">Pending</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Security Note ─────────────────────────────────── */}
                    <Card className="border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10">
                        <CardContent className="p-4 flex items-start gap-3">
                            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                Collaborators can manage issues and staff on their assigned properties only.
                                They cannot view your subscription details, payment information, or access other admins&apos; properties.
                                You can revoke access at any time.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="h-4 sm:h-0" />
                </div>
            </DashboardLayout>
        </div>
    );
};

export default CollaboratorsPage;