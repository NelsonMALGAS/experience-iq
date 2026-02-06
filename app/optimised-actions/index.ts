"use server";

import * as Sentry from "@sentry/nextjs";
import { db } from "@/db/server";
import { IssueCollection, Issue, StaffMember } from "@/types";
import { transformFirebaseDates } from "@/lib/transformTimeStamp";
import {
  aggregateByCategory,
  calculateAvgResolutionTime,
  calculateSLACompliance,
  staffColorPalette,
} from "@/lib/optimise-helpers";

/**
 * Fetch issues for staff dashboard - optimized to return flat array
 * Only fetches necessary fields and flattens issues in a single operation
 */
export async function fetchStaffIssues(staffId: string) {
  try {
    if (!db) throw new Error("Firestore not initialized");

    // Fetch all issue collections
    const snapshot = await db.collection("issues").get();

    // Flatten and filter issues in one pass
    const allIssues: Issue[] = [];

    snapshot.docs.forEach((doc) => {
      const data = transformFirebaseDates(doc.data()) as IssueCollection;

      if (data.issues && Array.isArray(data.issues)) {
        // Filter and transform in single pass
        data.issues.forEach((issue) => {
          // Only include relevant issues (assigned to staff or unassigned open issues)
          if (
            issue.assignedTo === staffId ||
            (!issue.assignedTo && issue.status === "open")
          ) {
            allIssues.push({
              ...issue,
            });
          }
        });
      }
    });

    return allIssues;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchStaffIssues", staffId },
    });
    console.error("Error fetching staff issues:", error);
    return [];
  }
}

/**
 * Fetch all issues for admin dashboard - returns flat array
 * Optimized to flatten issues during fetch
 */
export async function fetchAllIssues() {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const snapshot = await db.collection("issues").get();

    const allIssues: Issue[] = [];

    snapshot.docs.forEach((doc) => {
      const data = transformFirebaseDates(doc.data()) as IssueCollection;

      if (data.issues && Array.isArray(data.issues)) {
        data.issues.forEach((issue) => {
          allIssues.push({
            ...issue,
          });
        });
      }
    });

    return allIssues;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchAllIssues" },
    });
    console.error("Error fetching all issues:", error);
    return [];
  }
}

/**
 * Fetch issues for a specific guest - optimized and flattened
 */
export async function fetchGuestIssues(guestId: string) {
  try {
    if (!db) throw new Error("Firestore not initialized");

    // Query by document ID (propertyId-roomNumber or guestId pattern)
    const snapshot = await db.collection("issues").get();

    const guestIssues: Issue[] = [];

    snapshot.docs.forEach((doc) => {
      const data = transformFirebaseDates(doc.data()) as IssueCollection;

      if (data.issues && Array.isArray(data.issues)) {
        data.issues.forEach((issue) => {
          // Filter issues belonging to this guest
          if (issue.guestId === guestId) {
            guestIssues.push({
              ...issue,
            });
          }
        });
      }
    });

    // Sort by most recent first
    guestIssues.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return guestIssues;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchGuestIssues", guestId },
    });
    console.error("Error fetching guest issues:", error);
    return [];
  }
}

/**
 * Fetch critical issues (high priority, unresolved) - optimized
 */
export async function fetchCriticalIssues() {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const snapshot = await db.collection("issues").get();

    const criticalIssues: Issue[] = [];

    snapshot.docs.forEach((doc) => {
      const data = transformFirebaseDates(doc.data()) as IssueCollection;

      if (data.issues && Array.isArray(data.issues)) {
        data.issues.forEach((issue) => {
          // Only critical priority and not resolved
          if (issue.priority === "critical" && issue.status !== "resolved") {
            criticalIssues.push({
              ...issue,
            });
          }
        });
      }
    });

    // Sort by creation date (oldest first - most urgent)
    criticalIssues.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return criticalIssues;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchCriticalIssues" },
    });
    console.error("Error fetching critical issues:", error);
    return [];
  }
}

/**
 * Fetch unassigned issues - optimized
 */
export async function fetchUnassignedIssues() {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const snapshot = await db.collection("issues").get();

    const unassignedIssues: Issue[] = [];

    snapshot.docs.forEach((doc) => {
      const data = transformFirebaseDates(doc.data()) as IssueCollection;

      if (data.issues && Array.isArray(data.issues)) {
        data.issues.forEach((issue) => {
          // Only unassigned and not resolved
          if (!issue.assignedTo && issue.status !== "resolved") {
            unassignedIssues.push({
              ...issue,
            });
          }
        });
      }
    });

    // Sort by priority and creation date
    unassignedIssues.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff =
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return unassignedIssues;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchUnassignedIssues" },
    });
    console.error("Error fetching unassigned issues:", error);
    return [];
  }
}

/**
 * Fetch staff users with only necessary fields
 */
export async function getStaffUsers(): Promise<StaffMember[]> {
  try {
    if (!db) throw new Error("Firestore not initialized");

    // Query users collection with role filter
    const snapshot = await db
      .collection("users")
      .where("role", "in", ["staff"])
      .get();

    const staffMembers: StaffMember[] = snapshot.docs.map((doc, index) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.displayName ?? data.email ?? "Unknown",
        email: data.email ?? "unknown@example.com",
        isVerified: data.isVerified ?? false,
        color: staffColorPalette[index % staffColorPalette.length],
        department: data.department || "other",
      };
    });

    return staffMembers;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "getStaffUsers" },
    });
    console.error("Error fetching staff users:", error);
    return [];
  }
}

/**
 * Fetch verified staff users only
 */
export async function getVerifiedStaffUsers(): Promise<StaffMember[]> {
  try {
    if (!db) throw new Error("Firestore not initialized");

    // Query with compound filter
    const snapshot = await db
      .collection("users")
      .where("role", "in", ["staff", "admin"])
      .where("isVerified", "==", true)
      .get();

    const staffMembers: StaffMember[] = snapshot.docs.map((doc, index) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.displayName ?? data.email ?? "Unknown",
        email: data.email ?? "unknown@example.com",
        isVerified: true,
        color: staffColorPalette[index % staffColorPalette.length],
        department: data.department || "other",
      };
    });

    return staffMembers;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "getVerifiedStaffUsers" },
    });
    console.error("Error fetching verified staff users:", error);
    return [];
  }
}

/**
 * Calculate dashboard statistics server-side
 * Returns ready-to-render stats object
 */
export async function getDashboardStats() {
  try {
    const allIssues = await fetchAllIssues();

    const stats = {
      totalIssues: allIssues.length,
      openIssues: allIssues.filter((i) => i.status === "open").length,
      inProgressIssues: allIssues.filter((i) => i.status === "in_progress")
        .length,
      resolvedIssues: allIssues.filter((i) => i.status === "resolved").length,
      criticalIssues: allIssues.filter((i) => i.priority === "critical").length,
      avgResolutionTime: calculateAvgResolutionTime(allIssues),
      slaCompliance: calculateSLACompliance(allIssues),
      issuesByPriority: {
        critical: allIssues.filter((i) => i.priority === "critical").length,
        high: allIssues.filter((i) => i.priority === "high").length,
        medium: allIssues.filter((i) => i.priority === "medium").length,
        low: allIssues.filter((i) => i.priority === "low").length,
      },
      issuesByCategory: aggregateByCategory(allIssues),
    };

    return stats;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "getDashboardStats" },
    });
    console.error("Error calculating dashboard stats:", error);
    return null;
  }
}

/**
 * Calculate staff performance metrics server-side
 */
export async function getStaffPerformance(staffId: string) {
  try {
    const staffIssues = await fetchStaffIssues(staffId);
    const assignedIssues = staffIssues.filter((i) => i.assignedTo === staffId);

    const resolvedIssues = assignedIssues.filter(
      (i) => i.status === "resolved",
    );
    const avgResolutionTime = calculateAvgResolutionTime(resolvedIssues);

    const performance = {
      totalAssigned: assignedIssues.length,
      resolved: resolvedIssues.length,
      inProgress: assignedIssues.filter((i) => i.status === "in_progress")
        .length,
      open: assignedIssues.filter((i) => i.status === "open").length,
      avgResolutionTime,
      slaCompliance: calculateSLACompliance(assignedIssues),
      resolutionRate:
        assignedIssues.length > 0
          ? Math.round((resolvedIssues.length / assignedIssues.length) * 100)
          : 0,
    };

    return performance;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "getStaffPerformance", staffId },
    });
    console.error("Error calculating staff performance:", error);
    return null;
  }
}

/**
 * Generic fetch for non-issue collections
 * Use this for properties, settings, etc.
 */
export async function fetchCollection<T = unknown>(
  collectionName: string,
): Promise<(T & { id: string })[]> {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const snapshot = await db.collection(collectionName).get();

    const results = snapshot.docs.map((doc) => {
      const data = transformFirebaseDates(doc.data());

      return {
        id: doc.id,
        ...(data as Record<string, unknown>),
      };
    }) as (T & { id: string })[];

    return results;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchCollection", collection: collectionName },
    });
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}
