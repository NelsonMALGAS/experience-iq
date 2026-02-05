"use server";

import { cookies } from "next/headers";
import { auth } from "@/db/server";
import { Role } from "@/types";
import { DecodedIdToken } from "firebase-admin/auth";

interface RequireAuthOptions {
  role?: Role; // optional role check
}

interface RequireAuthResult {
  uid: string;
  decoded: DecodedIdToken | undefined;
  role: Role | null;
}

/**
 * Verifies the session cookie and returns auth info.
 * - Returns null if session is missing or invalid
 * - Does NOT redirect (caller decides what to do)
 */
export async function requireAuth(
  options?: RequireAuthOptions,
): Promise<RequireAuthResult> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("_SESSION_")?.value;

    if (!session) {
      return {
        uid: "",
        decoded: undefined,
        role: null,
      };
    }

    if (!auth) throw new Error("Firebase auth not initialized");

    const decoded = await auth.verifySessionCookie(session, true);

    if (!decoded || !decoded.uid) {
      return {
        uid: "",
        decoded: undefined,
        role: null,
      };
    }

    // Optional role enforcement
    if (options?.role && decoded.role !== options.role) {
      return {
        uid: "",
        decoded: undefined,
        role: null,
      };
    }

    return {
      uid: decoded.uid,
      decoded,
      role: decoded.role,
    };
  } catch (error) {
    console.error("❌ requireAuth error:", error);
    return {
      uid: "",
      decoded: undefined,
      role: null,
    };
  }
}
