"use server";

import { db } from "@/db/server";

/**
 * Links a staff member to an admin by setting adminId if not already set.
 * This is called automatically when an admin assigns an issue to staff.
 *
 * @param staffUid - The UID of the staff member
 * @param adminUid - The UID of the admin assigning the issue
 * @returns Success status and message
 */
export async function linkStaffToAdmin(
  staffUid: string,
  adminUid: string,
): Promise<{ success: boolean; message: string }> {
  try {
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    if (!staffUid || !adminUid) {
      return {
        success: false,
        message: "Invalid staff or admin UID",
      };
    }

    // Fetch the staff user document
    const staffDocRef = db.collection("users").doc(staffUid);
    const staffDoc = await staffDocRef.get();

    // If staff document doesn't exist, log but don't fail
    if (!staffDoc.exists) {
      console.warn(`Staff document not found for UID: ${staffUid}`);
      return {
        success: true,
        message: "Staff document not found, skipping adminId update",
      };
    }

    const staffData = staffDoc.data();

    // Check if staff already has an adminId
    if (staffData?.adminId) {
      return {
        success: true,
        message: "Staff already linked to an admin",
      };
    }

    // Verify this is actually a staff user
    if (staffData?.role !== "staff") {
      console.warn(
        `User ${staffUid} is not a staff member (role: ${staffData?.role})`,
      );
      return {
        success: true,
        message: "User is not a staff member, skipping adminId update",
      };
    }

    // Update staff document with adminId
    await staffDocRef.update({
      adminId: adminUid,
    });

    console.log(`Successfully linked staff ${staffUid} to admin ${adminUid}`);

    return {
      success: true,
      message: "Staff successfully linked to admin",
    };
  } catch (error) {
    console.error("Error linking staff to admin:", error);
    // Don't throw - we want issue assignment to succeed even if this fails
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
