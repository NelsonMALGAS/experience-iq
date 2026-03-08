"use server";

import { db } from "@/db/server";
import { cookies } from "next/headers";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import * as Sentry from "@sentry/nextjs";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface CollaboratorAdmin {
  uid: string;
  displayName: string;
  email: string;
  isVerified: boolean;
  disabled: boolean;
  inheritedFrom: string;
}

function getDb() {
  if (!db) throw new Error("Firestore not initialized");
  return db;
}

type AuditAction =
  | "verify_admin"
  | "revoke_admin"
  | "disable_admin"
  | "enable_admin"
  | "revoke_property_access"
  | "transfer_property_ownership"
  | "unauthorized_owner_action";

async function writeOwnerAuditLog(
  actorUid: string,
  action: AuditAction,
  targetUid?: string,
  propertyId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await getDb()
      .collection("auditLogs")
      .add({
        actorUid,
        action,
        targetUid: targetUid ?? null,
        propertyId: propertyId ?? null,
        metadata: metadata ?? null,
        timestamp: FieldValue.serverTimestamp(),
      });
  } catch (err) {
    // Audit failures must never block the main action — but always alert
    Sentry.captureException(err, {
      tags: { context: "ownerAuditLog", action },
    });
  }
}

// ─── Owner session resolver ───────────────────────────────────────────────────
// Centralises the session + isOwner check so every action calls one function.

async function resolveOwnerSession(): Promise<
  { success: true; uid: string } | { success: false; error: string }
> {
  const cookieStore = await cookies();
  const session = cookieStore.get("_SESSION_")?.value;

  const result = await requireVerifiedUser(session, "admin");

  if (!result.isOwner) {
    // Log the attempt — could indicate privilege escalation
    await writeOwnerAuditLog(
      result.uid,
      "unauthorized_owner_action",
      undefined,
      undefined,
      { reason: "isOwner check failed" },
    );
    return {
      success: false,
      error: "Unauthorised. Owner privileges required.",
    };
  }

  return { success: true, uid: result.uid };
}

// ─── Owner-specific collaborator validator ────────────────────────────────────
// Fetches a collaborator and validates it belongs to the calling owner.
// Returns the Firestore document data if valid.

async function resolveOwnedCollaborator(
  ownerUid: string,
  collaboratorId: string,
): Promise<
  | {
      success: true;
      data: FirebaseFirestore.DocumentData;
      ref: FirebaseFirestore.DocumentReference;
    }
  | { success: false; error: string }
> {
  const firestore = getDb();
  const ref = firestore.collection("users").doc(collaboratorId);
  const doc = await ref.get();

  if (!doc.exists) {
    return { success: false, error: "Collaborator not found." };
  }

  const data = doc.data()!;

  // Must be an admin role
  if (data.role !== "admin") {
    return { success: false, error: "Target user is not an admin." };
  }

  // Must be an inherited admin (not a main admin)
  if (data.adminType !== "inherited") {
    return { success: false, error: "Target admin is not a collaborator." };
  }

  // Must belong to this owner — this is the critical security check
  if (data.inheritedFrom !== ownerUid) {
    await writeOwnerAuditLog(
      ownerUid,
      "unauthorized_owner_action",
      collaboratorId,
      undefined,
      {
        reason: "inheritedFrom mismatch",
        collaboratorInheritedFrom: data.inheritedFrom,
      },
    );
    return {
      success: false,
      error: "This collaborator does not belong to your account.",
    };
  }

  // Owner cannot target themselves
  if (collaboratorId === ownerUid) {
    return {
      success: false,
      error: "You cannot perform this action on yourself.",
    };
  }

  return { success: true, data, ref };
}

/**
 * Owner sets isVerified = true on a collaborator admin.
 *
 * Security checks:
 *  - Caller must be isOwner
 *  - Target must be adminType === "inherited"
 *  - Target must have inheritedFrom === ownerUid
 *  - Owner cannot verify themselves
 *  - Owner cannot verify another owner's collaborator
 */
export async function verifyCollaboratorAdmin(
  collaboratorId: string,
): Promise<ActionResult> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return session;
    const ownerUid = session.uid;

    const resolved = await resolveOwnedCollaborator(ownerUid, collaboratorId);
    if (!resolved.success) return resolved;

    if (resolved.data.isVerified === true) {
      return {
        success: false,
        error: "This collaborator is already verified.",
      };
    }

    await resolved.ref.update({
      isVerified: true,
      verifiedAt: FieldValue.serverTimestamp(),
      verifiedBy: ownerUid,
    });

    await writeOwnerAuditLog(ownerUid, "verify_admin", collaboratorId);

    revalidatePath("/admin/collaborators");
    revalidatePath("/owner");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "verifyCollaboratorAdmin" },
    });
    return {
      success: false,
      error: "Failed to verify collaborator. Please try again.",
    };
  }
}

// ─── 2. revokeCollaboratorAdmin ───────────────────────────────────────────────

/**
 * Owner sets isVerified = false on a collaborator.
 * Immediately blocks their access on next request — requireVerifiedUser
 * returns canAccessData: false for unverified users.
 */
export async function revokeCollaboratorAdmin(
  collaboratorId: string,
): Promise<ActionResult> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return session;
    const ownerUid = session.uid;

    const resolved = await resolveOwnedCollaborator(ownerUid, collaboratorId);
    if (!resolved.success) return resolved;

    await resolved.ref.update({
      isVerified: false,
      revokedAt: FieldValue.serverTimestamp(),
      revokedBy: ownerUid,
    });

    await writeOwnerAuditLog(ownerUid, "revoke_admin", collaboratorId);

    revalidatePath("/admin/collaborators");
    revalidatePath("/owner");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "revokeCollaboratorAdmin" },
    });
    return {
      success: false,
      error: "Failed to revoke collaborator. Please try again.",
    };
  }
}

// ─── 3. disableCollaboratorAdmin ─────────────────────────────────────────────

/**
 * Owner sets disabled = true on a collaborator — harder block than revoking
 * verification. Used for immediate lockout (e.g. security incident).
 *
 * disabled: true is checked in requireVerifiedUser and in Firestore rules.
 * A disabled admin cannot log in or make any requests.
 */
export async function disableCollaboratorAdmin(
  collaboratorId: string,
): Promise<ActionResult> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return session;
    const ownerUid = session.uid;

    const resolved = await resolveOwnedCollaborator(ownerUid, collaboratorId);
    if (!resolved.success) return resolved;

    if (resolved.data.disabled === true) {
      return {
        success: false,
        error: "This collaborator is already disabled.",
      };
    }

    await resolved.ref.update({
      disabled: true,
      disabledAt: FieldValue.serverTimestamp(),
      disabledBy: ownerUid,
    });

    await writeOwnerAuditLog(ownerUid, "disable_admin", collaboratorId);

    revalidatePath("/owner");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "disableCollaboratorAdmin" },
    });
    return {
      success: false,
      error: "Failed to disable collaborator. Please try again.",
    };
  }
}

// ─── 4. enableCollaboratorAdmin ──────────────────────────────────────────────

export async function enableCollaboratorAdmin(
  collaboratorId: string,
): Promise<ActionResult> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return session;
    const ownerUid = session.uid;

    const resolved = await resolveOwnedCollaborator(ownerUid, collaboratorId);
    if (!resolved.success) return resolved;

    await resolved.ref.update({
      disabled: false,
      enabledAt: FieldValue.serverTimestamp(),
      enabledBy: ownerUid,
    });

    await writeOwnerAuditLog(ownerUid, "enable_admin", collaboratorId);

    revalidatePath("/owner");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "enableCollaboratorAdmin" },
    });
    return { success: false, error: "Failed to enable collaborator." };
  }
}

// ─── 5. getOwnerCollaborators ─────────────────────────────────────────────────

/**
 * Returns all collaborator admins belonging to this owner.
 * Returns only safe display fields — never subscription data.
 *
 * Query: users WHERE role=admin AND adminType=inherited AND inheritedFrom=ownerUid
 */
export async function getOwnerCollaborators(): Promise<CollaboratorAdmin[]> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return [];
    const ownerUid = session.uid;

    const firestore = getDb();

    const snapshot = await firestore
      .collection("users")
      .where("role", "==", "admin")
      .where("adminType", "==", "inherited")
      .where("inheritedFrom", "==", ownerUid)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        displayName: data.displayName ?? "Unknown",
        email: data.email ?? "",
        isVerified: data.isVerified ?? false,
        disabled: data.disabled ?? false,
        inheritedFrom: data.inheritedFrom,
        // ❌ No subscription, no payment data
      };
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { function: "getOwnerCollaborators" },
    });
    return [];
  }
}

// ─── 6. revokeCollaboratorPropertyAccess ─────────────────────────────────────

/**
 * Owner removes a collaborator from a specific property.
 *
 * Effects:
 *  - Sets propertyAccess document status to "revoked"
 *  - Removes collaboratorId from property's collaboratorIds array
 *  - Audit logged
 */
export async function revokeCollaboratorPropertyAccess(
  collaboratorId: string,
  propertyId: string,
): Promise<ActionResult> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return session;
    const ownerUid = session.uid;

    if (!collaboratorId || !propertyId) {
      return { success: false, error: "Missing required parameters." };
    }

    // Validate the collaborator belongs to this owner
    const resolved = await resolveOwnedCollaborator(ownerUid, collaboratorId);
    if (!resolved.success) return resolved;

    const firestore = getDb();

    // Find the active access record
    const accessSnapshot = await firestore
      .collection("propertyAccess")
      .where("grantedToAdminId", "==", collaboratorId)
      .where("propertyId", "==", propertyId)
      .where("propertyOwnerId", "==", ownerUid) // Extra ownership check
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (accessSnapshot.empty) {
      return {
        success: false,
        error:
          "No active access record found for this collaborator and property.",
      };
    }

    const accessRef = accessSnapshot.docs[0].ref;

    await firestore.runTransaction(async (tx) => {
      tx.update(accessRef, {
        status: "revoked",
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: ownerUid,
      });

      tx.update(firestore.collection("properties").doc(propertyId), {
        collaboratorIds: FieldValue.arrayRemove(collaboratorId),
      });
    });

    await writeOwnerAuditLog(
      ownerUid,
      "revoke_property_access",
      collaboratorId,
      propertyId,
    );

    revalidatePath("/owner");
    revalidatePath("/admin/collaborators");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "revokeCollaboratorPropertyAccess" },
    });
    return {
      success: false,
      error: "Failed to revoke property access. Please try again.",
    };
  }
}

// ─── 7. getCollaboratorActivityLogs ──────────────────────────────────────────

/**
 * Owner retrieves audit log entries where the target is one of their collaborators.
 * Returns the 50 most recent entries, newest first.
 */
export interface ActivityLogEntry {
  id: string;
  actorUid: string;
  action: string;
  targetUid: string | null;
  propertyId: string | null;
  timestamp: Date;
  metadata: Record<string, unknown> | null;
}

export async function getCollaboratorActivityLogs(
  collaboratorId: string,
): Promise<ActivityLogEntry[]> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return [];
    const ownerUid = session.uid;

    // Validate the collaborator belongs to this owner before showing their logs
    const resolved = await resolveOwnedCollaborator(ownerUid, collaboratorId);
    if (!resolved.success) return [];

    const firestore = getDb();

    const snapshot = await firestore
      .collection("auditLogs")
      .where("targetUid", "==", collaboratorId)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        actorUid: data.actorUid,
        action: data.action,
        targetUid: data.targetUid ?? null,
        propertyId: data.propertyId ?? null,
        timestamp: data.timestamp?.toDate?.() ?? new Date(),
        metadata: data.metadata ?? null,
      };
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { function: "getCollaboratorActivityLogs" },
    });
    return [];
  }
}

// ─── 8. transferPropertyOwnership ────────────────────────────────────────────

/**
 * Owner transfers a property to another verified main admin.
 *
 * Security checks:
 *  - Caller must be isOwner
 *  - Property must currently belong to caller (ownerId === ownerUid)
 *  - New owner must be verified, role=admin, adminType=main
 *  - New owner cannot be the same as current owner
 *  - New owner cannot be an inherited admin
 *
 * Effects:
 *  - property.ownerId updated to newOwnerUid
 *  - All existing propertyAccess records for that property are revoked
 *    (new owner starts clean — they manage their own collaborators)
 *  - collaboratorIds array cleared
 *  - Audit logged
 */
export async function transferPropertyOwnership(
  propertyId: string,
  newOwnerUid: string,
): Promise<ActionResult> {
  try {
    const session = await resolveOwnerSession();
    if (!session.success) return session;
    const ownerUid = session.uid;

    if (!propertyId || !newOwnerUid) {
      return { success: false, error: "Missing required parameters." };
    }

    if (newOwnerUid === ownerUid) {
      return { success: false, error: "You already own this property." };
    }

    const firestore = getDb();

    // Verify the property belongs to the calling owner
    const propertyDoc = await firestore
      .collection("properties")
      .doc(propertyId)
      .get();
    if (!propertyDoc.exists) {
      return { success: false, error: "Property not found." };
    }
    if (propertyDoc.data()?.ownerId !== ownerUid) {
      await writeOwnerAuditLog(
        ownerUid,
        "unauthorized_owner_action",
        newOwnerUid,
        propertyId,
        {
          reason: "Property does not belong to caller",
        },
      );
      return { success: false, error: "You do not own this property." };
    }

    // Verify the new owner is a verified main admin
    const newOwnerDoc = await firestore
      .collection("users")
      .doc(newOwnerUid)
      .get();
    if (!newOwnerDoc.exists) {
      return { success: false, error: "New owner account not found." };
    }

    const newOwnerData = newOwnerDoc.data()!;

    if (newOwnerData.role !== "admin") {
      return { success: false, error: "The new owner must be an admin." };
    }
    if (!newOwnerData.isVerified) {
      return { success: false, error: "The new owner must be verified." };
    }
    if (newOwnerData.adminType !== "main") {
      return {
        success: false,
        error: "The new owner must be a main admin, not a collaborator.",
      };
    }
    if (!newOwnerData.subscription?.hasAccess) {
      return {
        success: false,
        error: "The new owner must have an active subscription.",
      };
    }

    // Revoke all active property access records for this property
    const accessSnapshot = await firestore
      .collection("propertyAccess")
      .where("propertyId", "==", propertyId)
      .where("status", "==", "active")
      .get();

    await firestore.runTransaction(async (tx) => {
      // Transfer ownership
      tx.update(firestore.collection("properties").doc(propertyId), {
        ownerId: newOwnerUid,
        collaboratorIds: [], // New owner starts clean
        transferredAt: FieldValue.serverTimestamp(),
        transferredFrom: ownerUid,
      });

      // Revoke all existing access grants for this property
      for (const accessDoc of accessSnapshot.docs) {
        tx.update(accessDoc.ref, {
          status: "revoked",
          revokedAt: FieldValue.serverTimestamp(),
          revokedBy: ownerUid,
          revokeReason: "property_ownership_transferred",
        });
      }
    });

    await writeOwnerAuditLog(
      ownerUid,
      "transfer_property_ownership",
      newOwnerUid,
      propertyId,
      { previousOwner: ownerUid, newOwner: newOwnerUid },
    );

    revalidatePath("/owner");
    revalidatePath("/admin/properties");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "transferPropertyOwnership" },
    });
    return {
      success: false,
      error: "Failed to transfer property. Please try again.",
    };
  }
}
