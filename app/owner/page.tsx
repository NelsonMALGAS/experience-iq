import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users, ShieldCheck, ShieldOff, CreditCard, AlertTriangle, Calendar, Clock, Receipt, Hash, RefreshCw } from "lucide-react";
import Unverified from "@/components/Unverified";
import { getOwnerCollaborators } from "../admin-invite-actions/owner";
import { SubscriptionDetailsPopover } from "@/components/admins/SuscriptionDetailsPopover";
import { DisableCollaboratorButton, RevokeCollaboratorButton, VerifyCollaboratorButton } from "@/components/admins/OwnerActionButtons";
import { getBillingIntervalByPriceId } from "@/lib/plans";

function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const OwnerPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get("_SESSION_")?.value;
    const role: Role = "admin";

    const result = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData, subscription, adminId, isOwner, inheritedFrom } = result;

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={isOwner} />;
    }

    // ── Owner guard — only main admins with active subscriptions ──────────
    // isOwner is derived server-side from Firestore — never trusted from client
    if (!isOwner) {
        redirect("/admin");
    }

    // ── Fetch collaborators server-side ───────────────────────────────────
    const collaborators = await getOwnerCollaborators();

    const totalCollaborators = collaborators.length;
    const verifiedCount = collaborators.filter(c => c.isVerified && !c.disabled).length;
    const pendingCount = collaborators.filter(c => !c.isVerified && !c.disabled).length;
    const disabledCount = collaborators.filter(c => c.disabled).length;
    const billingInterval = getBillingIntervalByPriceId(subscription?.priceId)


    return (
        <div className="mt-16 sm:mt-20 lg:mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={isVerified} adminId={adminId} inheritedFrom={inheritedFrom} isOwner={isOwner}>
                <div className="space-y-6 sm:space-y-8 px-2 sm:px-6 lg:px-8 pb-10">

                    {/* ── Header ───────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    Owner Overview
                                </h1>
                                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                                    <Shield className="h-3 w-3" />
                                    Owner
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Governance controls for your account and collaborator admins
                            </p>
                        </div>
                    </div>

                    {/* ── Subscription Section ─────────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">Subscription</h2>
                            <Badge className={subscription?.hasAccess
                                ? "bg-green-100 text-green-800 border-green-200 text-xs"
                                : "bg-red-100 text-red-800 border-red-200 text-xs"
                            }>
                                {subscription?.hasAccess ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <Separator />

                        {/* Main subscription card */}
                        <Card className={`border ${subscription?.hasAccess
                            ? "border-green-200/60 dark:border-green-900/40"
                            : "border-red-200/60 dark:border-red-900/40"
                            }`}>
                            <CardContent className="p-4 sm:p-5">

                                {/* Top row: plan name + status + popover */}
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${subscription?.hasAccess
                                            ? "bg-green-100 dark:bg-green-900/40"
                                            : "bg-red-100 dark:bg-red-900/40"
                                            }`}>
                                            <CreditCard className={`h-5 w-5 ${subscription?.hasAccess
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-foreground">
                                                {subscription?.name ?? subscription?.name ?? "Subscription"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {subscription?.hasAccess
                                                    ? "Full access enabled for you and your collaborators"
                                                    : "Access suspended — renew to restore access"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Popover trigger for technical billing details */}
                                    <SubscriptionDetailsPopover subscription={subscription} />
                                </div>

                                {/* Divider */}
                                <Separator className="my-4" />

                                {/* Key metrics grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    {/* Amount */}
                                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Receipt className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Amount</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground tabular-nums">
                                            {subscription?.amount
                                                ? `R${(subscription.amount / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
                                                : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {billingInterval === "monthly"
                                                ? "per month"
                                                : billingInterval === "yearly"
                                                    ? "per year"
                                                    : "_"}
                                        </p>
                                    </div>

                                    {/* Billing period end */}
                                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Next Billing</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">
                                            {subscription?.currentPeriodEnd
                                                ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
                                                : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">period end</p>
                                    </div>

                                    {/* Last payment date */}
                                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Last Payment</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">
                                            {subscription?.lastPaymentDate
                                                ? new Date(subscription.lastPaymentDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
                                                : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {subscription?.lastPaymentAmount
                                                ? `R${(subscription.lastPaymentAmount / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
                                                : "—"}
                                        </p>
                                    </div>

                                    {/* Auto-renew status */}
                                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Auto-Renew</p>
                                        </div>
                                        <p className={`text-sm font-bold ${subscription?.cancelAtPeriodEnd ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                                            {subscription?.cancelAtPeriodEnd ? "Cancels" : "Enabled"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {subscription?.cancelAtPeriodEnd ? "at period end" : "recurring"}
                                        </p>
                                    </div>
                                </div>

                                {/* Last payment reference */}
                                {subscription?.lastPaymentReference && (
                                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                                        <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <p className="text-xs text-muted-foreground">
                                            Last payment ref:&nbsp;
                                            <span className="font-mono text-foreground">{subscription.lastPaymentReference}</span>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Subscription lapsed warning */}
                        {!subscription?.hasAccess && (
                            <Card className="border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                        Your subscription is not active. Your collaborator admins have lost inherited access and cannot manage properties until your subscription is renewed.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Cancel-at-period-end warning */}
                        {subscription?.hasAccess && subscription?.cancelAtPeriodEnd && (
                            <Card className="border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                        Your subscription is set to cancel on{" "}
                                        <strong>
                                            {subscription?.currentPeriodEnd
                                                ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
                                                : "the period end date"}
                                        </strong>. After this date, you and your collaborators will lose access.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* ── Summary Strip ────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {[
                            { icon: Users, label: "Total Collaborators", value: totalCollaborators, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
                            { icon: ShieldCheck, label: "Verified", value: verifiedCount, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
                            { icon: Shield, label: "Pending Verification", value: pendingCount, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
                            { icon: ShieldOff, label: "Disabled", value: disabledCount, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm">
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Collaborator Admin List ───────────────────────── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">
                                Collaborator Admins
                            </h2>
                            <Badge variant="outline">{totalCollaborators}</Badge>
                        </div>
                        <Separator />

                        {collaborators.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">No collaborator admins yet</p>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    Invite verified admins from the Collaborators page to add them here.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {collaborators.map((collab) => (
                                    <Card
                                        key={collab.uid}
                                        className={`shadow-sm border ${collab.disabled ? "opacity-60 border-red-200/40" : "border-border"}`}
                                    >
                                        <CardContent className="p-4 sm:p-5 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-9 w-9 shrink-0 border border-border">
                                                    <AvatarFallback className="text-xs font-semibold bg-muted">
                                                        {getInitials(collab.displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="text-sm font-semibold truncate">{collab.displayName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{collab.email}</p>
                                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                        {collab.disabled ? (
                                                            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Disabled</Badge>
                                                        ) : collab.isVerified ? (
                                                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Verified</Badge>
                                                        ) : (
                                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pending</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions — only owner sees these, confirmed server-side */}
                                            <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                                                {!collab.disabled && !collab.isVerified && (
                                                    <VerifyCollaboratorButton
                                                        collaboratorId={collab.uid}
                                                        name={collab.displayName}
                                                    />
                                                )}
                                                {!collab.disabled && collab.isVerified && (
                                                    <RevokeCollaboratorButton
                                                        collaboratorId={collab.uid}
                                                        name={collab.displayName}
                                                    />
                                                )}
                                                {!collab.disabled ? (
                                                    <DisableCollaboratorButton
                                                        collaboratorId={collab.uid}
                                                        name={collab.displayName}
                                                        mode="disable"
                                                    />
                                                ) : (
                                                    <DisableCollaboratorButton
                                                        collaboratorId={collab.uid}
                                                        name={collab.displayName}
                                                        mode="enable"
                                                    />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Security note ─────────────────────────────────── */}
                    <Card className="border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/10">
                        <CardContent className="p-4 flex items-start gap-3">
                            <Shield className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                All governance actions are validated server-side. Collaborator admins cannot modify their own verification status, subscription, or role. Revoking verification immediately blocks access on the collaborator&apos;s next request.
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </DashboardLayout>
        </div>
    );
};

export default OwnerPage;