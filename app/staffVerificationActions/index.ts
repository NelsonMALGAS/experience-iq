"use server";

import { db } from "@/db/server";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

/**
 * Sets isVerified: true for the given staff document.
 * Revalidates the staff-verification page so the UI reflects the change.
 */
export async function verifyStaffUser(staffId: string): Promise<void> {
  if (!staffId?.trim()) {
    Sentry.captureException(new Error("[verifyStaffUser] Missing staffId"));
    return;
  }

  if (!db) throw new Error("Firestore not initialized");

  try {
    await db.collection("users").doc(staffId).update({
      isVerified: true,
    });

    revalidatePath("/admin/staff-verification");
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "verifyStaffUser" },
      extra: { staffId },
    });
    throw new Error("Failed to verify staff member. Please try again.");
  }
}

/**
 * Sets isVerified: false for the given staff document.
 * Revalidates the staff-verification page so the UI reflects the change.
 */
export async function unverifyStaffUser(staffId: string): Promise<void> {
  if (!staffId?.trim()) {
    Sentry.captureException(new Error("[unverifyStaffUser] Missing staffId"));
    return;
  }

  if (!db) throw new Error("Firestore not initialized");

  try {
    await db.collection("users").doc(staffId).update({
      isVerified: false,
    });

    revalidatePath("/admin/staff-verification");
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "unverifyStaffUser" },
      extra: { staffId },
    });
    throw new Error("Failed to unverify staff member. Please try again.");
  }
}

export const deleteStaffUser = async (staffId: string): Promise<void> => {
  if (!staffId?.trim()) {
    Sentry.captureException(new Error("[deleteStaffUser] Missing staffId"));
    return;
  }

  if (!db) throw new Error("Firestore not initialized");

  try {
    const docRef = db.collection("users").doc(staffId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn(
        `[deleteStaffUser] Staff document ${staffId} does not exist`,
      );
      return;
    }

    await docRef.delete();
    console.log(`[deleteStaffUser] Staff ${staffId} deleted successfully`);
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: "deleteStaffUser" } });
    console.error("Error deleting staff user:", error);
  }
};
