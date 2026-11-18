import { auth, db } from "@/db/server";
import { Role, UserSubscription } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  hasSubscriptionAccess,
  getTrialDaysRemaining,
} from "@/lib/subscriptionAccess";

export type VerificationResult = {
  uid: string;
  isVerified: boolean;
  role: Role;
  canAccessData: boolean;
  subscription?: UserSubscription | null;
  adminId?: string | null;
  adminType?: "main" | "inherited";
  inheritedFrom?: string;
  isOwner: boolean;
  hasAccess: boolean;
  trialDaysRemaining: number | null;
  status?: string | undefined;
};

/**
 * Verifies session and checks user verification status
 * Returns verification info or redirects to login
 *
 * @param session - Session cookie value
 * @param role - Expected user role
 * @returns VerificationResult with user info and verification status
 */
export async function requireVerifiedUser(
  session: string | undefined,
  role: Role,
): Promise<VerificationResult> {
  // ── 1. Session must exist ─────────────────────────────────────────────
  if (!session) {
    redirect(`/login?role=${role}`);
  }
  if (!role) {
    redirect("/");
  }

  // ── 2. Verify session cookie with Firebase Auth ───────────────────────
  const decoded = await auth?.verifySessionCookie(session, true);
  if (!decoded?.uid) {
    redirect(`/login?role=${role}`);
  }

  const uid = decoded.uid;

  // ── 3. Guests: always verified, no subscription logic ─────────────────
  if (role === "guest") {
    return {
      uid,
      isVerified: true,
      role: "guest",
      canAccessData: true,
      subscription: null,
      adminId: null,
      isOwner: false,
      hasAccess: true,
      trialDaysRemaining: null,
    };
  }

  // ── 4. Staff and Admin: fetch user document ───────────────────────────
  try {
    const userDoc = await db?.collection("users").doc(uid).get();

    if (!userDoc?.exists) {
      return unverifiedResult(uid, role);
    }

    const userData = userDoc.data()!;
    const isVerified: boolean = userData.isVerified ?? false;

    if (!isVerified) {
      return unverifiedResult(uid, role);
    }

    // ── ADMIN path ────────────────────────────────────────────────────
    if (role === "admin") {
      // adminType defaults to "main" for legacy accounts created before
      // the field existed — they have no inheritedFrom so they are main.
      const adminType: "main" | "inherited" = userData.adminType ?? "main";
      const inheritedFrom: string | undefined =
        userData.inheritedFrom ?? undefined;

      let subscription: UserSubscription | null | undefined =
        userData.subscription ?? null;

      // Inherited admins: resolve subscription from their main admin
      if (adminType === "inherited" && inheritedFrom) {
        const ownerDoc = await db?.collection("users").doc(inheritedFrom).get();

        if (ownerDoc?.exists) {
          const ownerData = ownerDoc.data()!;
          // Use owner's subscription — never expose sensitive Paystack fields
          subscription = ownerData.subscription ?? null;
        }
        // If owner doc doesn't exist or has no subscription, inherited
        // admin loses access — subscription stays null
      }

      // ✅ isOwner: derived from Firestore data only, never from client input
      const isOwner =
        isVerified && adminType === "main" && subscription?.hasAccess === true;

      return {
        uid,
        isVerified,
        role: "admin",
        canAccessData: isVerified,
        subscription,
        adminId: uid,
        adminType,
        inheritedFrom,
        isOwner,
        hasAccess: hasSubscriptionAccess(subscription),
        trialDaysRemaining: getTrialDaysRemaining(subscription),
      };
    }

    if (role === "staff") {
      const adminId: string | null = userData.adminId ?? null;

      if (!adminId) {
        return {
          uid,
          isVerified,
          role: "staff",
          canAccessData: isVerified,
          subscription: null,
          adminId: null,
          isOwner: false,
          hasAccess: false,
          trialDaysRemaining: null,
        };
      }

      const adminDoc = await db?.collection("users").doc(adminId).get();

      if (!adminDoc?.exists) {
        return {
          uid,
          isVerified,
          role: "staff",
          canAccessData: isVerified,
          subscription: null,
          adminId,
          isOwner: false,
          hasAccess: false,
          trialDaysRemaining: null,
        };
      }

      const adminData = adminDoc.data()!;
      const adminVerified: boolean = adminData.isVerified ?? false;

      if (!adminVerified) {
        return {
          uid,
          isVerified,
          role: "staff",
          canAccessData: isVerified,
          subscription: null,
          adminId,
          isOwner: false,
          hasAccess: false,
          trialDaysRemaining: null,
        };
      }

      // Staff inherit subscription from their managing admin
      const subscription: UserSubscription | null | undefined =
        adminData.subscription ?? null;

      return {
        uid,
        isVerified,
        role: "staff",
        canAccessData: isVerified,
        subscription,
        adminId,
        isOwner: false, // Staff are never owners
        hasAccess: hasSubscriptionAccess(subscription),
        trialDaysRemaining: getTrialDaysRemaining(subscription),
        status: subscription?.status ?? "trialing",
      };
    }

    // ── Fail closed: unknown role ─────────────────────────────────────
    return unverifiedResult(uid, role);
  } catch (error) {
    console.error("[requireVerifiedUser] Error fetching user:", error);
    return unverifiedResult(uid, role);
  }
}

function unverifiedResult(uid: string, role: Role): VerificationResult {
  return {
    uid,
    isVerified: false,
    role,
    canAccessData: false,
    subscription: null,
    adminId: null,
    isOwner: false,
    hasAccess: false,
    trialDaysRemaining: null,
  };
}

/**
 * Short-circuit helper: stops execution if user is unverified
 * Use this at the top of data-fetching functions
 *
 * @param verificationResult - Result from requireVerifiedUser
 * @returns true if verified, false if not (caller should return early)
 */
export function guardDataAccess(
  verificationResult: VerificationResult,
): boolean {
  return verificationResult.canAccessData;
}

/**
 * Verify admin authentication
 */
export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore?.get("_SESSION_")?.value;

  if (!session) {
    throw new Error("Unauthorized: No session found");
  }

  const decoded = await auth?.verifySessionCookie(session, true);
  if (!decoded) {
    throw new Error("Unauthorized: Invalid session");
  }

  // Optional: Check if user has admin role in custom claims
  // if (decoded.role !== 'admin') {
  //   throw new Error("Forbidden: Admin access required");
  // }

  return { uid: decoded.uid, role: decoded.role };
}
