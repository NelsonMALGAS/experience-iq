import { auth, db } from "@/db/server";
import { Role, UserSubscription } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type VerificationResult = {
  uid: string;
  isVerified: boolean;
  role: Role;
  canAccessData: boolean;
  subscription?: UserSubscription | null;
  adminId?: string | null;
  adminType?: "main" | "inherited";
  inheritedFrom?: string;
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
  "use server";

  // 1. Check session exists
  if (!session) {
    redirect(`/login?role=${role}`);
  }
  if (!role) {
    redirect("/");
  }

  // 2. Verify session cookie
  const decoded = await auth?.verifySessionCookie(session, true);
  if (!decoded?.uid) {
    redirect(`/login?role=${role}`);
  }

  const uid = decoded.uid;

  // 3. Guests: always verified, no subscription logic
  if (role === "guest") {
    return {
      uid,
      isVerified: true,
      role: "guest",
      canAccessData: true,
      subscription: null,
      adminId: null,
    };
  }

  try {
    const userDoc = await db?.collection("users").doc(uid).get();

    if (!userDoc?.exists) {
      return {
        uid,
        isVerified: false,
        role,
        canAccessData: false,
        subscription: null,
        adminId: null,
      };
    }

    const userData = userDoc.data();
    const isVerified = userData?.isVerified ?? false;

    // 🔐 Always verify first (admins & staff)
    if (!isVerified) {
      return {
        uid,
        isVerified: false,
        role,
        canAccessData: false,
        subscription: null,
        adminId: null,
      };
    }

    // ✅ ADMIN: return own subscription
    if (role === "admin") {
      const subscription = userData?.subscription ?? null;
      const adminType = userData?.adminType ?? "inherited";
      const inheritedFrom = userData?.inheritedFrom ?? undefined;

      const inheritedDoc = inheritedFrom
        ? await db?.collection("users").doc(uid).get()
        : null;

      if (!inheritedDoc?.exists) {
        return {
          uid,
          isVerified: isVerified,
          role: "admin",
          canAccessData: isVerified,
          subscription,
          adminId: uid,
          adminType: adminType,
          inheritedFrom: inheritedFrom,
        };
      }

      const inheritedData = inheritedDoc.data();
      const inheritedSubscription = inheritedData?.subscription ?? null;

      return {
        uid,
        isVerified: isVerified,
        role: "admin",
        canAccessData: isVerified,
        subscription: inheritedSubscription ?? subscription,
        adminId: uid,
        adminType: adminType,
        inheritedFrom: inheritedFrom,
      };
    }

    // ✅ STAFF: fetch admin subscription using adminId
    if (role === "staff") {
      const adminId = userData?.adminId ?? null;

      if (!adminId) {
        return {
          uid,
          isVerified: isVerified,
          role: "staff",
          canAccessData: isVerified,
          subscription: null,
          adminId: null,
        };
      }

      const adminDoc = adminId
        ? await db?.collection("users").doc(adminId).get()
        : null;

      if (!adminDoc?.exists) {
        return {
          uid,
          isVerified: isVerified,
          role: "staff",
          canAccessData: isVerified,
          subscription: null,
          adminId,
        };
      }

      const adminData = adminDoc.data();
      const adminVerified = adminData?.isVerified ?? false;

      if (!adminVerified) {
        return {
          uid,
          isVerified: isVerified,
          role: "staff",
          canAccessData: isVerified,
          subscription: null,
          adminId,
        };
      }

      const subscription = adminData?.subscription ?? null;

      return {
        uid,
        isVerified: isVerified,
        role: "staff",
        canAccessData: isVerified,
        subscription,
        adminId,
      };
    }

    // Fail closed
    return {
      uid,
      isVerified: false,
      role,
      canAccessData: isVerified,
      subscription: null,
      adminId: null,
    };
  } catch (error) {
    console.error("Error fetching user verification status:", error);

    return {
      uid,
      isVerified: false,
      role,
      canAccessData: false,
      subscription: null,
      adminId: null,
    };
  }
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
