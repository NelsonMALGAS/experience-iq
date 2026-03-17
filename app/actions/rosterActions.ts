"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, db } from "@/db/server";
import { FieldValue } from "firebase-admin/firestore";

// Type definitions
interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  updatedAt?: string;
}

interface RosterData {
  id?: string;
  month: string;
  year: number;
  shifts: Shift[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type ActionResult<T = unknown> =
  | { success: true; data: T; message: string }
  | { success: false; message: string };

/**
 * Verify user session and check if user is admin
 */
async function verifyAdminSession(): Promise<{
  success: boolean;
  uid?: string;
  message?: string;
}> {
  try {
    if (!auth) {
      return { success: false, message: "Firebase Auth not initialized" };
    }
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("_SESSION_")?.value;

    if (!sessionCookie) {
      return {
        success: false,
        message: "No session cookie found. Please log in.",
      };
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Get user's custom claims to check role
    const userRecord = await auth.getUser(uid);
    const customClaims = userRecord.customClaims;

    if (!customClaims?.role || customClaims.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized. Admin access required.",
      };
    }

    return { success: true, uid };
  } catch (error) {
    console.error("Session verification error:", error);
    return {
      success: false,
      message: "Invalid or expired session. Please log in again.",
    };
  }
}

/**
 * Add a shift to an existing roster document
 * @param rosterId - The ID of the roster document
 * @param payload - Shift data without the id field
 */
export async function addShiftToRoster(
  rosterId: string,
  payload: Omit<Shift, "id">,
): Promise<ActionResult<Shift>> {
  try {
    if (!db) {
      return { success: false, message: "Firestore not initialized" };
    }
    // Verify admin session
    const verification = await verifyAdminSession();
    if (!verification.success) {
      return {
        success: false,
        message: verification.message || "Unauthorized",
      };
    }

    // Validate rosterId
    if (!rosterId || typeof rosterId !== "string") {
      return { success: false, message: "Invalid roster ID provided." };
    }

    // Validate payload
    if (
      !payload.staffId ||
      !payload.date ||
      !payload.startTime ||
      !payload.endTime
    ) {
      return { success: false, message: "Missing required shift fields." };
    }

    // Get roster document
    const rosterRef = db.collection("rosters").doc(rosterId);
    const rosterDoc = await rosterRef.get();

    if (!rosterDoc.exists) {
      return { success: false, message: "Roster not found." };
    }

    // Create new shift with ID and timestamp
    const newShift: Shift = {
      id: crypto.randomUUID(),
      staffId: payload.staffId,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      notes: payload.notes || "",
      updatedAt: new Date().toISOString(),
    };

    // Update roster with new shift
    await rosterRef.update({
      shifts: FieldValue.arrayUnion(newShift),
      updatedAt: new Date().toISOString(),
    });

    // Revalidate the roster page
    revalidatePath("/admin/roster");

    return {
      success: true,
      message: "Shift added successfully.",
      data: newShift,
    };
  } catch (error) {
    console.error("Error adding shift:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add shift.",
    };
  }
}

/**
 * Update a shift inside a roster document
 * @param rosterId - The ID of the roster document
 * @param shiftId - The ID of the shift to update
 * @param updates - Partial shift data to update
 */
export async function updateShiftInRoster(
  rosterId: string,
  shiftId: string,
  updates: Partial<Omit<Shift, "id">>,
): Promise<ActionResult<Shift>> {
  try {
    if (!db) {
      return { success: false, message: "Firestore not initialized" };
    }
    // Verify admin session
    const verification = await verifyAdminSession();
    if (!verification.success) {
      return {
        success: false,
        message: verification.message || "Unauthorized",
      };
    }

    // Validate inputs
    if (!rosterId || typeof rosterId !== "string") {
      return { success: false, message: "Invalid roster ID provided." };
    }

    if (!shiftId || typeof shiftId !== "string") {
      return { success: false, message: "Invalid shift ID provided." };
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, message: "No update fields provided." };
    }

    // Get roster document
    const rosterRef = db.collection("rosters").doc(rosterId);
    const rosterDoc = await rosterRef.get();

    if (!rosterDoc.exists) {
      return { success: false, message: "Roster not found." };
    }

    const rosterData = rosterDoc.data() as RosterData;
    const shifts = rosterData.shifts || [];

    // Find the shift to update
    const shiftIndex = shifts.findIndex((shift) => shift.id === shiftId);

    if (shiftIndex === -1) {
      return { success: false, message: "Shift not found in roster." };
    }

    // Update the shift
    const updatedShift = {
      ...shifts[shiftIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    shifts[shiftIndex] = updatedShift;

    // Update the roster document
    await rosterRef.update({
      shifts: shifts,
      updatedAt: new Date().toISOString(),
    });

    // Revalidate the roster page
    revalidatePath("/admin/roster");

    return {
      success: true,
      message: "Shift updated successfully.",
      data: updatedShift,
    };
  } catch (error) {
    console.error("Error updating shift:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update shift.",
    };
  }
}

/**
 * Remove a shift from a roster document
 * @param rosterId - The ID of the roster document
 * @param shiftId - The ID of the shift to remove
 */
export async function removeShiftFromRoster(
  rosterId: string,
  shiftId: string,
): Promise<ActionResult<{ removedShiftId: string }>> {
  try {
    if (!db) {
      return { success: false, message: "Firestore not initialized" };
    }
    // Verify admin session
    const verification = await verifyAdminSession();
    if (!verification.success) {
      return {
        success: false,
        message: verification.message || "Unauthorized",
      };
    }

    // Validate inputs
    if (!rosterId || typeof rosterId !== "string") {
      return { success: false, message: "Invalid roster ID provided." };
    }

    if (!shiftId || typeof shiftId !== "string") {
      return { success: false, message: "Invalid shift ID provided." };
    }

    // Get roster document
    const rosterRef = db.collection("rosters").doc(rosterId);
    const rosterDoc = await rosterRef.get();

    if (!rosterDoc.exists) {
      return { success: false, message: "Roster not found." };
    }

    const rosterData = rosterDoc.data() as RosterData;
    const shifts = rosterData.shifts || [];

    // Find the shift to remove
    const shiftToRemove = shifts.find((shift) => shift.id === shiftId);

    if (!shiftToRemove) {
      return { success: false, message: "Shift not found in roster." };
    }

    // Remove the shift from the array
    const updatedShifts = shifts.filter((shift) => shift.id !== shiftId);

    // Update the roster document
    await rosterRef.update({
      shifts: updatedShifts,
      updatedAt: new Date().toISOString(),
    });

    // Revalidate the roster page
    revalidatePath("/admin/roster");

    return {
      success: true,
      message: "Shift removed successfully.",
      data: { removedShiftId: shiftId },
    };
  } catch (error) {
    console.error("Error removing shift:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to remove shift.",
    };
  }
}

/**
 * Create a new roster document
 * @param rosterData - Roster data including month, year, and initial shifts
 */
export async function createRoster(
  rosterData: Omit<RosterData, "id" | "createdAt" | "createdBy">,
): Promise<ActionResult<RosterData>> {
  try {
    if (!db) {
      return { success: false, message: "Firestore not initialized" };
    }

    const verification = await verifyAdminSession();
    if (!verification.success || !verification.uid) {
      return {
        success: false,
        message: verification.message || "Unauthorized",
      };
    }

    const uid = verification.uid;

    // 1️⃣ Check if roster already exists for this admin + month + year
    const existingRosterQuery = await db
      .collection("rosters")
      .where("createdBy", "==", uid)
      .where("month", "==", rosterData.month)
      .where("year", "==", rosterData.year)
      .limit(1)
      .get();

    if (!existingRosterQuery.empty) {
      const doc = existingRosterQuery.docs[0];

      return {
        success: true,
        message: "Roster already exists for this month.",
        data: {
          id: doc.id,
          ...(doc.data() as Omit<RosterData, "id">),
        },
      };
    }

    // 2️⃣ Create a new roster (new month/year)
    const newRoster: Omit<RosterData, "id"> = {
      month: rosterData.month,
      year: rosterData.year,
      shifts: rosterData.shifts ?? [],
      createdBy: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rosterRef = await db.collection("rosters").add(newRoster);

    revalidatePath("/admin/roster");

    return {
      success: true,
      message: "Roster created successfully.",
      data: { id: rosterRef.id, ...newRoster },
    };
  } catch (error) {
    console.error("Error creating roster:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create roster",
    };
  }
}

/**
 * Get a roster by ID
 * @param rosterId - The ID of the roster document
 */
export async function getRosterById(rosterId: string): Promise<ActionResult> {
  try {
    if (!db || !auth) {
      return { success: false, message: "Firebase Admin not initialized" };
    }
    // Verify session (any authenticated user can view)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("_SESSION_")?.value;

    if (!sessionCookie) {
      return {
        success: false,
        message: "No session cookie found. Please log in.",
      };
    }

    await auth.verifySessionCookie(sessionCookie, true);

    // Get roster document
    const rosterRef = db.collection("rosters").doc(rosterId);
    const rosterDoc = await rosterRef.get();

    if (!rosterDoc.exists) {
      return { success: false, message: "Roster not found." };
    }

    return {
      success: true,
      message: "Roster retrieved successfully.",
      data: { id: rosterDoc.id, ...rosterDoc.data() },
    };
  } catch (error) {
    console.error("Error getting roster:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get roster.",
    };
  }
}

/**
 * Get all rosters for a specific month and year
 * @param month - The month name (e.g., "February")
 * @param year - The year number (e.g., 2026)
 */
export async function getRostersByMonthYear(
  month: string,
  year: number,
): Promise<ActionResult> {
  try {
    if (!db || !auth) {
      return { success: false, message: "Firebase Admin not initialized" };
    }
    // Verify session (any authenticated user can view)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("_SESSION_")?.value;

    if (!sessionCookie) {
      return {
        success: false,
        message: "No session cookie found. Please log in.",
      };
    }

    await auth.verifySessionCookie(sessionCookie, true);

    // Query rosters by month and year
    const rostersSnapshot = await db
      .collection("rosters")
      .where("month", "==", month)
      .where("year", "==", year)
      .get();

    const rosters = rostersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      message: "Rosters retrieved successfully.",
      data: rosters,
    };
  } catch (error) {
    console.error("Error getting rosters:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get rosters.",
    };
  }
}

export async function updateShiftNotes(
  rosterId: string,
  shiftId: string,
  notes: string,
): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: "Firebase Admin not initialized" };
  }
  try {
    const rosterRef = db.collection("rosters").doc(rosterId);
    const roster = await rosterRef.get();

    if (!roster.exists) return { success: false, message: "Roster not found" };

    const shifts: Shift[] = roster.data()?.shifts ?? [];
    const updated = shifts.map((s) =>
      s.id === shiftId ? { ...s, notes: notes.trim() || null } : s,
    );

    await rosterRef.update({ shifts: updated });
    return { success: true, message: "Notes updated" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update notes" };
  }
}
