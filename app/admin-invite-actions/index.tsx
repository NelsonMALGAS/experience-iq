"use server";

import { DEFAULT_PERMISSIONS } from "@/constants";
import { db } from "@/db/server";
import { AdminPermissions, AuditLogEntry, EligibleAdminForInvite, SanitisedPropertyAccess } from "@/types";
import * as Sentry from "@sentry/nextjs";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";


export interface ResolvedSubscription {
    hasAccess: boolean;
    planName?: string;
    propertyLimit?: number;
    staffLimit?: number;
    isInherited: boolean;
    ownerDisplayName?: string;

}

/**
 * Resolves subscription access for any admin type.
 * Called on every protected page — never exposes payment info.
 */
export async function resolveAdminSubscription(
    uid: string
): Promise<ResolvedSubscription> {

    if (!db) throw new Error("Firestore not initialized")
    try {
        const adminDoc = await db.collection("users").doc(uid).get();
        if (!adminDoc.exists) {
            return { hasAccess: false, isInherited: false };
        }

        const admin = adminDoc.data()!;

        // ── Main admin — read their own subscription ──────────────────────
        if (admin.adminType === "main" || !admin.adminType) {
            const sub = admin.subscription;
            return {
                hasAccess: sub?.hasAccess === true,
                planName: sub?.planName,
                propertyLimit: sub?.propertyLimit,
                staffLimit: sub?.staffLimit,
                isInherited: false,
            };
        }

        // ── Inherited admin — read main admin's subscription ──────────────
        if (admin.adminType === "inherited" && admin.inheritedFrom) {
            if (!db) throw new Error("Firestore not initialized")
            const ownerDoc = await db
                .collection("users")
                .doc(admin.inheritedFrom)
                .get();

            if (!ownerDoc.exists) {
                return { hasAccess: false, isInherited: true };
            }

            const ownerSub = ownerDoc.data()?.subscription;

            return {
                hasAccess: ownerSub?.hasAccess === true,
                planName: ownerSub?.planName,
                propertyLimit: ownerSub?.propertyLimit,
                staffLimit: ownerSub?.staffLimit,
                isInherited: true,
                ownerDisplayName: ownerDoc.data()?.displayName,
            };
        }

        return { hasAccess: false, isInherited: false };

    } catch (error) {
        Sentry.captureException(error, { tags: { function: "resolveAdminSubscription" } });
        return { hasAccess: false, isInherited: false };
    }
}

/**
 * Quick boolean check — use in middleware or guards where you only
 * need access/no-access without the full subscription object.
 */
export async function hasActiveSubscription(uid: string): Promise<boolean> {
    const resolved = await resolveAdminSubscription(uid);

    console.log(resolved, "hasActiveSubscription")
    return resolved.hasAccess;
}


// ─── Action Result Type ───────────────────────────────────────────────────────

export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string };

// ─── Audit Logger ─────────────────────────────────────────────────────────────

async function writeAuditLog(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    try {

        if (!db) throw new Error("Firestore not initialized")
        await db.collection("auditLogs").add({
            ...entry,
            timestamp: FieldValue.serverTimestamp(),
        });
    } catch (err) {
        // Audit log failures must not block the main action — but DO alert
        Sentry.captureException(err, { tags: { context: "auditLog" } });
    }
}

// ─── 1. inviteAdminToProperty ─────────────────────────────────────────────────

/**
 * Only a verified main admin with an active subscription can invite.
 * The target admin must be:
 *   - verified
 *   - adminType === "main" with no subscription OR adminType === "inherited"
 *   - not already invited/assigned to this property
 */
export async function inviteAdminToProperty(
    inviterUid: string,
    targetAdminId: string,
    propertyId: string,
    permissions: AdminPermissions = DEFAULT_PERMISSIONS
): Promise<ActionResult<{ invitationId: string }>> {
    try {
        // ── 1. Validate inputs ─────────────────────────────────────────────
        if (!inviterUid || !targetAdminId || !propertyId) {
            return { success: false, error: "Missing required parameters." };
        }
        if (inviterUid === targetAdminId) {
            return { success: false, error: "You cannot invite yourself." };
        }

        if (!db) throw new Error("Firestore not initialized")

        // ── 2. Verify the inviting admin ───────────────────────────────────
        const inviterDoc = await db.collection("users").doc(inviterUid).get();
        if (!inviterDoc.exists) {
            return { success: false, error: "Inviting admin not found." };
        }

        const inviter = inviterDoc.data()!;

        if (!inviter.isVerified) {
            return { success: false, error: "Your account is not verified." };
        }
        if (inviter.adminType !== "main") {
            return { success: false, error: "Only main admins can invite others." };
        }
        if (!inviter.subscription?.hasAccess) {
            return { success: false, error: "Your subscription is not active." };
        }

        // ── 3. Verify the property belongs to the inviter ──────────────────
        const propertyDoc = await db.collection("properties").doc(propertyId).get();
        if (!propertyDoc.exists) {
            return { success: false, error: "Property not found." };
        }

        const property = propertyDoc.data()!;
        if (property.ownerId !== inviterUid) {
            // Log unauthorized attempt
            await writeAuditLog({
                action: "unauthorized_access_attempt",
                performedByUid: inviterUid,
                propertyId,
                metadata: { attempted: "inviteAdminToProperty", targetAdminId },
            });
            return { success: false, error: "You do not own this property." };
        }

        if (!db) throw new Error("Firestore not initialized")

        // ── 4. Check target admin eligibility ──────────────────────────────
        const targetDoc = await db.collection("users").doc(targetAdminId).get();
        if (!targetDoc.exists) {
            return { success: false, error: "Target admin not found." };
        }

        const target = targetDoc.data()!;

        if (!target.isVerified) {
            return { success: false, error: "The invited admin is not verified yet." };
        }

        // Block if target already has their own active subscription
        if (target.subscription?.hasAccess === true) {
            return {
                success: false,
                error: "This admin already has an active subscription and cannot be added as a collaborator.",
            };
        }

        // Block if target already owns properties
        const ownedProperties = await db
            .collection("properties")
            .where("ownerId", "==", targetAdminId)
            .limit(1)
            .get();

        if (!ownedProperties.empty) {
            return {
                success: false,
                error: "This admin already owns properties and cannot be added as a collaborator.",
            };
        }

        // ── 5. Check for duplicate invitation or existing access ───────────
        const existingInvite = await db
            .collection("adminInvitations")
            .where("invitedByAdminId", "==", inviterUid)
            .where("invitedAdminId", "==", targetAdminId)
            .where("propertyId", "==", propertyId)
            .where("status", "==", "pending")
            .limit(1)
            .get();

        if (!existingInvite.empty) {
            return { success: false, error: "A pending invitation already exists for this admin." };
        }

        const existingAccess = await db
            .collection("propertyAccess")
            .where("grantedToAdminId", "==", targetAdminId)
            .where("propertyId", "==", propertyId)
            .where("status", "==", "active")
            .limit(1)
            .get();

        if (!existingAccess.empty) {
            return { success: false, error: "This admin already has access to this property." };
        }

        // ── 6. Create invitation (1 year expiry) ────────────────────────────
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const invitationRef = db.collection("adminInvitations").doc();
        await invitationRef.set({
            propertyId,
            propertyName: property.name,
            invitedByAdminId: inviterUid,
            invitedAdminId: targetAdminId,
            invitedAdminEmail: target.email,
            status: "pending",
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAt),
            permissions,
        });

        // ── 7. Audit log ───────────────────────────────────────────────────
        await writeAuditLog({
            action: "admin_invited",
            performedByUid: inviterUid,
            targetAdminId,
            propertyId,
            invitationId: invitationRef.id,
            metadata: { propertyName: property.name, targetEmail: target.email },
        });

        revalidatePath("/admin/collaborators");
        return { success: true, data: { invitationId: invitationRef.id } };

    } catch (error) {
        Sentry.captureException(error, { tags: { action: "inviteAdminToProperty" } });
        return { success: false, error: "Failed to send invitation. Please try again." };
    }
}

// ─── 2. acceptAdminInvitation ─────────────────────────────────────────────────

/**
 * The invited admin accepts. Uses a Firestore transaction to prevent
 * race conditions where two accepts could fire simultaneously.
 */
export async function acceptAdminInvitation(
    acceptingAdminUid: string,
    invitationId: string
): Promise<ActionResult> {
    try {
        if (!acceptingAdminUid || !invitationId) {
            return { success: false, error: "Missing required parameters." };
        }

        if (!db) throw new Error("Firestore not initialized")

        const result = await db.runTransaction(async (tx) => {

            if (!db) throw new Error("Firestore not initialized")

            const inviteRef = db.collection("adminInvitations").doc(invitationId);
            const inviteDoc = await tx.get(inviteRef);

            if (!inviteDoc.exists) {
                return { success: false, error: "Invitation not found." };
            }

            const invite = inviteDoc.data()!;

            // Security: ensure the accepting admin is the invited admin
            if (invite.invitedAdminId !== acceptingAdminUid) {
                await writeAuditLog({
                    action: "unauthorized_access_attempt",
                    performedByUid: acceptingAdminUid,
                    invitationId,
                    metadata: { attempted: "acceptAdminInvitation" },
                });
                return { success: false, error: "This invitation was not sent to you." };
            }

            if (invite.status !== "pending") {
                return { success: false, error: `This invitation is already ${invite.status}.` };
            }

            // Check expiry
            const now = Timestamp.now();
            if (invite.expiresAt.toMillis() < now.toMillis()) {
                tx.update(inviteRef, { status: "expired" });
                return { success: false, error: "This invitation has expired." };
            }

            // Verify the main admin's subscription is still active at accept time
            const ownerDoc = await tx.get(
                db.collection("users").doc(invite.invitedByAdminId)
            );
            if (!ownerDoc.exists || !ownerDoc.data()?.subscription?.hasAccess) {
                return {
                    success: false,
                    error: "The property owner's subscription is no longer active.",
                };
            }

            // Verify the accepting admin is still eligible
            const acceptorDoc = await tx.get(
                db.collection("users").doc(acceptingAdminUid)
            );
            if (!acceptorDoc.exists || !acceptorDoc.data()?.isVerified) {
                return { success: false, error: "Your account is not eligible to accept invitations." };
            }
            if (acceptorDoc.data()?.subscription?.hasAccess) {
                return {
                    success: false,
                    error: "You now have an active subscription and cannot accept collaborator invitations.",
                };
            }

            // ── All checks passed — grant access ──────────────────────────

            // 1. Update invitation status
            tx.update(inviteRef, {
                status: "accepted",
                acceptedAt: FieldValue.serverTimestamp(),
            });

            // 2. Create propertyAccess document
            const accessRef = db.collection("propertyAccess").doc();
            tx.set(accessRef, {
                propertyId: invite.propertyId,
                propertyOwnerId: invite.invitedByAdminId,
                grantedToAdminId: acceptingAdminUid,
                grantedByAdminId: invite.invitedByAdminId,
                grantedAt: FieldValue.serverTimestamp(),
                status: "active",
                permissions: invite.permissions,
            });

            // 3. Add uid to property's collaboratorIds array
            tx.update(db.collection("properties").doc(invite.propertyId), {
                collaboratorIds: FieldValue.arrayUnion(acceptingAdminUid),
            });

            // 4. Update the accepting admin's adminType
            tx.update(db.collection("users").doc(acceptingAdminUid), {
                adminType: "inherited",
                inheritedFrom: invite.invitedByAdminId,
            });

            return { success: true };
        });

        if (!result.success) return result as ActionResult;

        // Audit log (outside transaction — non-critical)
        await writeAuditLog({
            action: "invitation_accepted",
            performedByUid: acceptingAdminUid,
            invitationId,
        });

        revalidatePath("/admin");
        revalidatePath("/admin/properties");
        revalidatePath("/admin/invitations");
        return { success: true };

    } catch (error) {
        Sentry.captureException(error, { tags: { action: "acceptAdminInvitation" } });
        return { success: false, error: "Failed to accept invitation. Please try again." };
    }
}

// ─── 3. revokeAdminAccess ─────────────────────────────────────────────────────

/**
 * Main admin revokes an inherited admin's access to a property.
 * Sets access status to "revoked" (never deletes — audit trail).
 * Removes uid from property's collaboratorIds.
 */
export async function revokeAdminAccess(
    revokerUid: string,
    accessId: string
): Promise<ActionResult> {
    try {
        if (!revokerUid || !accessId) {
            return { success: false, error: "Missing required parameters." };
        }
        if (!db) throw new Error("Firestore not initialized")

        const accessRef = db.collection("propertyAccess").doc(accessId);
        const accessDoc = await accessRef.get();

        if (!accessDoc.exists) {
            return { success: false, error: "Access record not found." };
        }

        const access = accessDoc.data()!;

        // Only the property owner can revoke
        if (access.propertyOwnerId !== revokerUid) {
            await writeAuditLog({
                action: "unauthorized_access_attempt",
                performedByUid: revokerUid,
                metadata: { attempted: "revokeAdminAccess", accessId },
            });
            return { success: false, error: "You are not authorised to revoke this access." };
        }

        if (access.status === "revoked") {
            return { success: false, error: "This access has already been revoked." };
        }

        await db.runTransaction(async (tx) => {
            // 1. Mark access as revoked
            tx.update(accessRef, {
                status: "revoked",
                revokedAt: FieldValue.serverTimestamp(),
            });

            if (!db) throw new Error("Firestore not initialized")

            // 2. Remove from property collaboratorIds
            tx.update(db.collection("properties").doc(access.propertyId), {
                collaboratorIds: FieldValue.arrayRemove(access.grantedToAdminId),
            });

            // 3. If inherited admin has no other active accesses, reset adminType
            // (checked outside transaction below to avoid transaction reads)
        });

        // Check if the inherited admin has any remaining active accesses
        const remainingAccesses = await db
            .collection("propertyAccess")
            .where("grantedToAdminId", "==", access.grantedToAdminId)
            .where("status", "==", "active")
            .get();

        if (remainingAccesses.empty) {
            await db.collection("users").doc(access.grantedToAdminId).update({
                adminType: "main",      // Revert to main (unsubscribed)
                inheritedFrom: FieldValue.delete(),
            });
        }

        await writeAuditLog({
            action: "access_revoked",
            performedByUid: revokerUid,
            targetAdminId: access.grantedToAdminId,
            propertyId: access.propertyId,
        });

        revalidatePath("/admin/collaborators");
        return { success: true };

    } catch (error) {
        Sentry.captureException(error, { tags: { action: "revokeAdminAccess" } });
        return { success: false, error: "Failed to revoke access. Please try again." };
    }
}

// ─── 4. fetchEligibleAdmins ───────────────────────────────────────────────────

/**
 * Returns verified admins that can be invited — no subscription, no owned properties.
 * Returns ONLY safe fields — never subscription data.
 */
export async function fetchEligibleAdmins(
    inviterUid: string
): Promise<EligibleAdminForInvite[]> {

    if (!db) throw new Error("Firestore not initialized")
    try {
        // Get all verified admins with no active subscription
        const snapshot = await db
            .collection("users")
            .where("role", "==", "admin")
            .where("isVerified", "==", true)
            .get();

        // Filter out self, those with subscriptions, and those who own properties
        // (Firestore doesn't support != or complex multi-field exclusions in one query,
        // so we filter in memory after a broad fetch)
        const candidates = snapshot.docs
            .filter(doc => {
                const data = doc.data();
                return (
                    doc.id !== inviterUid &&
                    !data.subscription?.hasAccess &&
                    !data.inheritedFrom
                );
            })
            .map(doc => ({
                uid: doc.id,
                displayName: doc.data().displayName,
                email: doc.data().email,
                department: doc.data().department,
            }));


        // Filter out admins who own properties
        const ownedChecks = await Promise.all(
            candidates.map(async (c) => {
                if (!db) throw new Error("Firestore not initialized")
                const owned = await db
                    .collection("properties")
                    .where("ownerId", "==", c.uid)
                    .limit(1)
                    .get();
                return owned.empty ? c : null;
            })
        );

        return ownedChecks.filter(Boolean) as EligibleAdminForInvite[];

    } catch (error) {
        Sentry.captureException(error, { tags: { function: "fetchEligibleAdmins" } });
        return [];
    }
}

// ─── 5. fetchInheritedAdminProperties ────────────────────────────────────────

/**
 * Returns sanitised property access records for an inherited admin.
 * NEVER returns subscription data, ownerId details, or payment info.
 * Validates main admin's subscription is still active before returning.
 */
export async function fetchInheritedAdminProperties(
    inheritedAdminUid: string
): Promise<SanitisedPropertyAccess[]> {

    if (!db) throw new Error("Firestore not initialized")
    try {
        // Get all active access records for this admin
        const accessSnapshot = await db
            .collection("propertyAccess")
            .where("grantedToAdminId", "==", inheritedAdminUid)
            .where("status", "==", "active")
            .get();

        if (accessSnapshot.empty) return [];

        const results: SanitisedPropertyAccess[] = [];

        for (const accessDoc of accessSnapshot.docs) {
            const access = accessDoc.data();

            // Verify main admin subscription is still active
            // (do this per-record to handle partial revocations)
            const ownerDoc = await db
                .collection("admins")
                .doc(access.propertyOwnerId)
                .get();

            if (!ownerDoc.exists || !ownerDoc.data()?.subscription?.hasAccess) {
                // Main admin's subscription lapsed — skip this property silently
                // (don't revoke here — let a scheduled job handle cleanup)
                continue;
            }

            // Fetch property details
            const propertyDoc = await db
                .collection("properties")
                .doc(access.propertyId)
                .get();

            if (!propertyDoc.exists) continue;

            const property = propertyDoc.data()!;

            // Return only safe, sanitised fields
            results.push({
                accessId: accessDoc.id,
                propertyId: access.propertyId,
                propertyName: property.name,
                propertyLocation: property.location,
                propertyCode: property.code,
                grantedAt: access.grantedAt.toDate(),
                permissions: access.permissions,
                ownerDisplayName: ownerDoc.data()?.displayName ?? "Property Owner",
            });
        }

        return results;

    } catch (error) {
        Sentry.captureException(error, { tags: { function: "fetchInheritedAdminProperties" } });
        return [];
    }
}

// ─── 6. declineAdminInvitation ────────────────────────────────────────────────

export async function declineAdminInvitation(
    decliningAdminUid: string,
    invitationId: string
): Promise<ActionResult> {
    if (!db) throw new Error("Firestore not initialized")
    try {
        const inviteRef = db.collection("adminInvitations").doc(invitationId);
        const inviteDoc = await inviteRef.get();

        if (!inviteDoc.exists) return { success: false, error: "Invitation not found." };

        const invite = inviteDoc.data()!;
        if (invite.invitedAdminId !== decliningAdminUid) {
            return { success: false, error: "This invitation was not sent to you." };
        }
        if (invite.status !== "pending") {
            return { success: false, error: `This invitation is already ${invite.status}.` };
        }

        await inviteRef.update({
            status: "declined",
            declinedAt: FieldValue.serverTimestamp(),
        });

        await writeAuditLog({
            action: "invitation_declined",
            performedByUid: decliningAdminUid,
            invitationId,
            propertyId: invite.propertyId,
        });

        revalidatePath("/admin/invitations");
        return { success: true };

    } catch (error) {
        Sentry.captureException(error, { tags: { action: "declineAdminInvitation" } });
        return { success: false, error: "Failed to decline invitation." };
    }
}