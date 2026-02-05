"use server";

import { db, auth } from "@/db/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RosterData } from "@/types";

type UpdateShiftPayload = Partial<RosterData>;

/**
 * Create a new shift
 */
export async function createShift(payload: RosterData) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return { success: false, message: "Firebase is not initialized" };
    }
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) throw new Error("Unauthorized: No session found");

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) throw new Error("Unauthorized: Invalid session");

    if (decoded.role !== "admin") {
      throw new Error("Access denied: Only admins can create shifts");
    }

    const newShift: RosterData = {
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
      createdBy: decoded.uid,
    };

    await db.collection("shifts").doc(newShift.id!).set(newShift);

    // Optional: revalidate a page that lists shifts
    revalidatePath("/admin/roster");

    return {
      success: true,
      message: "Shift created successfully",
      shift: newShift,
    };
  } catch (error) {
    console.error("Error creating shift:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create shift",
    };
  }
}

/**
 * Update an existing shift
 */
export async function updateShift(
  shiftId: string,
  updates: UpdateShiftPayload,
) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return { success: false, message: "Firebase is not initialized" };
    }
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) throw new Error("Unauthorized: No session found");

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) throw new Error("Unauthorized: Invalid session");

    if (decoded.role !== "admin") {
      throw new Error("Access denied: Only admins can update shifts");
    }

    const shiftRef = db.collection("shifts").doc(shiftId);
    const doc = await shiftRef.get();
    if (!doc.exists) throw new Error("Shift not found");

    await shiftRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/roster");

    return { success: true, message: "Shift updated successfully" };
  } catch (error) {
    console.error("Error updating shift:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update shift",
    };
  }
}

/**
 * Delete a shift
 */
export async function deleteShift(shiftId: string) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return { success: false, message: "Firebase is not initialized" };
    }
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) throw new Error("Unauthorized: No session found");

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) throw new Error("Unauthorized: Invalid session");

    if (decoded.role !== "admin") {
      throw new Error("Access denied: Only admins can delete shifts");
    }

    const shiftRef = db.collection("shifts").doc(shiftId);
    const doc = await shiftRef.get();
    if (!doc.exists) throw new Error("Shift not found");

    await shiftRef.delete();

    revalidatePath("/admin/roster");

    return { success: true, message: "Shift deleted successfully" };
  } catch (error) {
    console.error("Error deleting shift:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete shift",
    };
  }
}
