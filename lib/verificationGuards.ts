import { auth, db } from "@/db/server";
import { Role } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type VerificationResult = {
  uid: string;
  isVerified: boolean;
  role: Role;
  canAccessData: boolean;
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

  // 2. Verify session cookie
  const decoded = await auth?.verifySessionCookie(session, true);
  if (!decoded) {
    redirect(`/login?role=${role}`);
  }

  const uid = decoded.uid;
  if (!uid) {
    redirect(`/login?role=${role}`);
  }

  // 3. For guests: always verified
  if (role === "guest") {
    return {
      uid,
      isVerified: true,
      role: "guest",
      canAccessData: true,
    };
  }

  // 4. For staff/admin: check Firestore verification status
  try {
    const userDoc = await db?.collection("users").doc(uid).get();

    if (!userDoc?.exists) {
      // User document doesn't exist - treat as unverified
      return {
        uid,
        isVerified: false,
        role,
        canAccessData: false,
      };
    }

    const userData = userDoc.data();
    const isVerified = userData?.isVerified ?? false;

    return {
      uid,
      isVerified,
      role,
      canAccessData: isVerified,
    };
  } catch (error) {
    console.error("Error fetching user verification status:", error);
    // On error, fail closed - treat as unverified
    return {
      uid,
      isVerified: false,
      role,
      canAccessData: false,
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
