"use server";

import * as Sentry from "@sentry/nextjs";
import { db } from "@/db/server";
import { RosterData } from "@/types";

/**
 * Fetch roster for a specific month and year
 * Returns roster with all shifts if found, or null if doesn't exist
 */
export async function fetchRosterByMonthYear(
  month: string,
  year: number,
): Promise<{ success: boolean; data: RosterData | null; message?: string }> {
  try {
    if (!db) throw new Error("Firestore not initialized");

    // Query rosters collection for matching month and year
    const rostersSnapshot = await db
      .collection("rosters")
      .where("month", "==", month)
      .where("year", "==", year)
      .limit(1) // Only need one roster per month/year
      .get();

    // If no roster found, return null
    if (rostersSnapshot.empty) {
      return {
        success: true,
        data: null,
        message: "No roster found for this month",
      };
    }

    // Get the first (and should be only) roster
    const rosterDoc = rostersSnapshot.docs[0];
    const rosterData = rosterDoc.data();

    // Transform Firestore data to RosterData type
    const roster: RosterData = {
      id: rosterDoc.id,
      month: rosterData.month,
      year: rosterData.year,
      shifts: rosterData.shifts || [],
      createdAt:
        rosterData.createdAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      createdBy: rosterData.createdBy || "",
    };

    return {
      success: true,
      data: roster,
      message: "Roster fetched successfully",
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchRosterByMonthYear", month, year },
    });
    console.error("Error fetching roster:", error);

    return {
      success: false,
      data: null,
      message:
        error instanceof Error ? error.message : "Failed to fetch roster",
    };
  }
}

/**
 * Fetch all rosters for a specific year
 * Useful for year overview or calendar navigation
 */
export async function fetchRostersByYear(
  year: number,
): Promise<{ success: boolean; data: RosterData[]; message?: string }> {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const rostersSnapshot = await db
      .collection("rosters")
      .where("year", "==", year)
      .orderBy("month", "asc")
      .get();

    const rosters: RosterData[] = rostersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        month: data.month,
        year: data.year,
        shifts: data.shifts || [],
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdBy: data.createdBy || "",
      };
    });

    return {
      success: true,
      data: rosters,
      message: `Found ${rosters.length} roster(s) for ${year}`,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchRostersByYear", year },
    });
    console.error("Error fetching rosters:", error);

    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch rosters",
    };
  }
}
