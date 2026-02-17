"use server";

import * as Sentry from "@sentry/nextjs";
import { auth, db } from "@/db/server";
import {
  IssueCollection,
  Issue,
  StaffMember,
  CreatePropertyData,
  UpdateIssuePayload,
} from "@/types";
import { transformFirebaseDates } from "@/lib/transformTimeStamp";
import {
  aggregateByCategory,
  calculateAvgResolutionTime,
  calculateSLACompliance,
  staffColorPalette,
} from "@/lib/optimise-helpers";
import { calculateDashboardStats } from "@/utils/dashboardUtiils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/verificationGuards";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Fetch issues for staff dashboard - optimized to return flat array
 * Only fetches necessary fields and flattens issues in a single operation
 */
export const fetchStaffIssues = async (staffId: string) => {
  console.log("fetchStaffIssues called");
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
};

/**
 * Fetch all issues for admin dashboard - returns flat array
 * Optimized to flatten issues during fetch
 */
export const fetchAllIssues = cache(async () => {
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
});

/**
 * Fetch a single issue by issueId
 * Stops early once the issue is found
 */
export async function fetchIssueById(issueId: string) {
  console.log("fetchIssueById called");
  try {
    if (!db) throw new Error("Firestore not initialized");

    const snapshot = await db.collection("issues").get();

    for (const doc of snapshot.docs) {
      const data = transformFirebaseDates(doc.data()) as IssueCollection;

      if (!Array.isArray(data.issues)) continue;

      const foundIssue = data.issues.find((issue) => issue.id === issueId);

      if (foundIssue) {
        return {
          ...foundIssue,
        };
      }
    }

    return null;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchIssueById" },
    });
    console.error("Error fetching issue by id:", error);
    return null;
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
        role: data.role || "guest",
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
      .where("role", "in", ["staff", "admin", "guest"])
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
        role: data.role || "guest",
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
    const { avgResolutionTime } = calculateDashboardStats(staffIssues);

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

/**
 * Create a new property
 */
export async function createProperty(data: CreatePropertyData) {
  try {
    const { uid } = await verifyAdmin();

    // Validate input
    if (!data.name?.trim()) {
      return { success: false, message: "Property name is required" };
    }
    if (!data.location?.trim()) {
      return { success: false, message: "Location is required" };
    }

    if (!data.code?.trim()) {
      return { success: false, message: "Code is required" };
    }

    if (!data.rooms.length || data.rooms.length === 0) {
      return { success: false, message: "Please add atleast 1 room" };
    }

    if (!db) throw new Error("Firestore not initialized");

    // Create property document
    const propertyRef = db.collection("properties").doc();
    await propertyRef.set({
      name: data.name.trim(),
      location: data.location.trim(),
      totalIssues: 0,
      openIssues: 0,
      avgResolutionTime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: uid,
      code: data.code.trim(),
      rooms: data.rooms,
    });

    revalidatePath("/admin/properties");

    return {
      success: true,
      message: "Property created successfully",
      propertyId: propertyRef.id,
    };
  } catch (error) {
    console.error("Error creating property:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create property",
    };
  }
}

export async function updateIssue(
  issueId: string,
  propertyId: string,
  updates: UpdateIssuePayload,
) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return {
        success: false,
        message: "Firebase is not initialized",
      };
    }

    // Verify admin authentication
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) {
      throw new Error("Unauthorized: No session found");
    }

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) {
      throw new Error("Unauthorized: Invalid session");
    }

    // Try to get the issue document
    // First, try using propertyId as document ID
    let issueDocRef = db.collection("issues").doc(propertyId);
    let issueDoc = await issueDocRef.get();

    // If not found, try to find the document by querying
    if (!issueDoc.exists) {
      console.log(
        `Document not found with ID: ${propertyId}, searching all documents...`,
      );

      const allIssuesSnapshot = await db.collection("issues").get();

      // Search through all documents to find the one containing this issue
      for (const doc of allIssuesSnapshot.docs) {
        const data = doc.data();
        if (data?.issues) {
          const hasIssue = data.issues.some(
            (issue: Issue) => issue.id === issueId,
          );
          if (hasIssue) {
            issueDocRef = doc.ref;
            issueDoc = doc;
            break;
          }
        }
      }
    }

    if (!issueDoc.exists) {
      const errorMsg = `Issue document not found. Issue ID: ${issueId}, Property ID: ${propertyId}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const data = issueDoc.data();
    if (!data?.issues) {
      throw new Error("Issues array not found in document");
    }

    // Find and update the specific issue
    const issues = data.issues as Issue[];
    const issueIndex = issues.findIndex((i: Issue) => i.id === issueId);

    if (issueIndex === -1) {
      throw new Error(
        `Issue with ID ${issueId} not found in document ${issueDoc.id}`,
      );
    }

    const prevIssue = issues[issueIndex];
    const nextStatus = updates.status ?? prevIssue.status;

    issues[issueIndex] = {
      ...prevIssue,
      ...updates,
      updatedAt: new Date(),
      resolvedAt:
        nextStatus === "resolved" ? (prevIssue.resolvedAt ?? new Date()) : null,
    };

    // Write back to Firestore
    await issueDocRef.update({
      issues,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");

    return { success: true, message: "Issue updated successfully" };
  } catch (error) {
    console.error("Error updating issue:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update issue",
    };
  }
}

export async function bulkUpdateIssueStatus(
  issueIds: string[],
  propertyId: string,
  status: Issue["status"],
) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return {
        success: false,
        message: "Firebase is not initialized",
      };
    }
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) {
      throw new Error("Unauthorized");
    }

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) {
      throw new Error("Unauthorized");
    }

    const issueDocRef = db.collection("issues").doc(propertyId);
    const issueDoc = await issueDocRef.get();

    if (!issueDoc.exists) {
      throw new Error("Issue document not found");
    }

    const data = issueDoc.data();
    const issues = data?.issues as Issue[];

    // Update all matching issues
    const updatedIssues = issues.map((issue: Issue) => {
      if (issueIds.includes(issue.id)) {
        return {
          ...issue,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    await issueDocRef.update({
      issues: updatedIssues,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");

    return { success: true, message: "Issues updated successfully" };
  } catch (error) {
    console.error("Error bulk updating issues:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update issues",
    };
  }
}

export async function refreshShifts() {
  redirect("/staff/roster");
}
