"use server";

import * as Sentry from "@sentry/nextjs";
import { db } from "@/db/server";
import { Issue, Property, Room } from "@/types";
import { fetchAllIssues } from ".";
import { toDate } from "date-fns";

/**
 * Property statistics derived from issues collection
 */
interface PropertyStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  totalResolutionTime: number; // in milliseconds
}

/**
 * Property enriched with live statistics
 */
export type PropertyWithStats = Property & {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number; // in hours
};

/**
 * Fetch all properties for the logged-in admin, enriched with live statistics derived from related issues.
 *
 * ARCHITECTURE:
 * - The `issues` collection is the SINGLE SOURCE OF TRUTH.
 * - Property statistics (total/open/resolved issues, average resolution time) are DERIVED at read time.
 * - Never rely on precomputed stats stored on property documents.
 *
 * PERFORMANCE:
 * - Reuses the optimized `fetchAllIssues()` function, which returns a flat array of issues.
 * - Parallel fetching with `Promise.all` for efficiency.
 * - Aggregation is O(n) using a Map; avoids nested loops.
 * - Batched Firestore queries handle the 10-item `in` query limit safely.
 */
export async function fetchPropertiesWithStats(
  uid: string,
  inheritedFrom?: string,
): Promise<{ properties: PropertyWithStats[]; issues: Issue[] }> {
  try {
    if (!db) throw new Error("Firestore not initialized");
    if (!uid) throw new Error("Unauthorized");

    const propertyQuery = inheritedFrom
      ? db
          .collection("properties")
          .where("ownerId", "==", inheritedFrom)
          .where("collaboratorIds", "array-contains", uid)
          .orderBy("createdAt", "desc")
      : db
          .collection("properties")
          .where("ownerId", "==", uid)
          .orderBy("createdAt", "desc");

    const [propertiesSnapshot, allIssues] = await Promise.all([
      propertyQuery.get(),
      fetchAllIssues(),
    ]);

    const properties: Property[] = propertiesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ownerId: data.ownerId,
        name: data.name || "Unnamed Property",
        location: data.location || "Unknown Location",
        code: data.code || doc.id.substring(0, 6).toUpperCase(),
        rooms: (data.rooms || []).map((room: Room) => ({
          ...room,
          createdAt: toDate(room.createdAt) || room.createdAt || null,
        })),
        createdAt: toDate(data.createdAt),
        avgResolutionTime: data.avgResolutionTime,
        openIssues: data.openIssues,
        resolvedIssues: data.resolvedIssues,
        totalIssues: data.totalIssues,
      } as Property;
    });

    const statsMap = new Map<string, PropertyStats>();

    // Initialize stats for all properties
    properties.forEach((property) => {
      statsMap.set(property.id, {
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        totalResolutionTime: 0,
      });
    });

    // Filter issues to only those belonging to this owner's properties
    const ownerIssues = allIssues.filter((issue: Issue) =>
      statsMap.has(issue.propertyId),
    );

    // Aggregate stats
    ownerIssues.forEach((issue: Issue) => {
      const stats = statsMap.get(issue.propertyId)!;

      stats.totalIssues += 1;
      if (issue.status === "resolved") {
        stats.resolvedIssues += 1;

        if (issue.resolvedAt && issue.createdAt) {
          const createdAt = toDate(issue.createdAt).getTime();
          const resolvedAt = toDate(issue.resolvedAt).getTime();
          const resolutionTime = resolvedAt - createdAt;
          if (resolutionTime > 0) stats.totalResolutionTime += resolutionTime;
        }
      } else {
        stats.openIssues += 1;
      }
    });

    const propertiesWithStats: PropertyWithStats[] = properties.map(
      (property) => {
        const stats = statsMap.get(property.id)!;

        const avgResolutionTime =
          stats.resolvedIssues > 0
            ? Math.round(
                (stats.totalResolutionTime /
                  stats.resolvedIssues /
                  (1000 * 60 * 60)) *
                  10,
              ) / 10
            : 0;

        return {
          ...property,
          totalIssues: stats.totalIssues,
          openIssues: stats.openIssues,
          resolvedIssues: stats.resolvedIssues,
          avgResolutionTime,
        };
      },
    );

    return {
      properties: propertiesWithStats,
      issues: ownerIssues,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchPropertiesWithStats" },
    });
    console.error("Error fetching properties with stats:", error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 * Now redirects to the optimized version
 *
 * @deprecated Use fetchPropertiesWithStats() instead
 */
export async function fetchProperties(
  uid: string,
  inheritedFrom?: string,
): Promise<PropertyWithStats[]> {
  const { properties } = await fetchPropertiesWithStats(uid, inheritedFrom);

  return properties;
}

/**
 * Fetch statistics for a single property
 * Useful for property detail pages
 */
export async function fetchPropertyStats(propertyId: string) {
  try {
    if (!db) throw new Error("Firestore not initialized");

    // ✅ Reuse existing optimized function
    const allIssues = await fetchAllIssues();

    // Filter issues for this property
    const propertyIssues = allIssues.filter(
      (issue) => issue.propertyId === propertyId,
    );

    // Aggregate statistics
    let totalIssues = 0;
    let openIssues = 0;
    let resolvedIssues = 0;
    let totalResolutionTime = 0;

    propertyIssues.forEach((issue) => {
      totalIssues += 1;

      if (issue.status === "resolved") {
        resolvedIssues += 1;

        if (issue.resolvedAt && issue.createdAt) {
          const createdAt = new Date(issue.createdAt).getTime();
          const resolvedAt = new Date(issue.resolvedAt).getTime();
          const resolutionTime = resolvedAt - createdAt;

          if (resolutionTime > 0) {
            totalResolutionTime += resolutionTime;
          }
        }
      } else {
        openIssues += 1;
      }
    });

    const avgResolutionTime =
      resolvedIssues > 0
        ? Math.round(
            (totalResolutionTime / resolvedIssues / (1000 * 60 * 60)) * 10,
          ) / 10
        : 0;

    const stats = {
      propertyId,
      totalIssues,
      openIssues,
      resolvedIssues,
      avgResolutionTime,
      resolutionRate:
        totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
    };

    return stats;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "fetchPropertyStats", propertyId },
    });
    console.error("Error fetching property stats:", error);
    throw error;
  }
}
