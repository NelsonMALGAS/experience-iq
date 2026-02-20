"use server";

import * as Sentry from "@sentry/nextjs";
import { db } from "@/db/server";
import { Issue, Property } from "@/types";
import { fetchAllIssues } from ".";

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
): Promise<PropertyWithStats[]> {
  try {
    if (!db) throw new Error("Firestore not initialized");
    if (!uid) throw new Error("Unauthorized");

    const [propertiesSnapshot, allIssues] = await Promise.all([
      db
        .collection("properties")
        .where("ownerId", "==", uid)
        .orderBy("createdAt", "desc")
        .get(),
      fetchAllIssues(), // ✅ Reuse existing optimized function - already returns flat array
    ]);

    const properties: Property[] = propertiesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ownerId: data.ownerId,
        name: data.name || "Unnamed Property",
        location: data.location || "Unknown Location",
        code: data.code || doc.id.substring(0, 6).toUpperCase(),
        rooms: data.rooms || [],
        createdAt: data.createdAt?.toDate?.() || new Date(),
        avgResolutionTime: data.avgResolutionTime,
        openIssues: data.openIssues,
        resolvedIssues: data.resolvedIssues,
        totalIssues: data.totalIssues,
      } as Property;
    });

    const statsMap = new Map<string, PropertyStats>();

    // Initialize stats for all properties (even those with no issues)
    properties.forEach((property) => {
      statsMap.set(property.id, {
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        totalResolutionTime: 0,
      });
    });

    // Aggregate from issues (already flat array from fetchAllIssues)
    allIssues.forEach((issue: Issue) => {
      const propertyId = issue.propertyId;

      // Skip issues for properties that don't exist
      if (!statsMap.has(propertyId)) {
        return;
      }

      const stats = statsMap.get(propertyId)!;

      // Increment total issues
      stats.totalIssues += 1;

      // Count open vs resolved
      if (issue.status === "resolved") {
        stats.resolvedIssues += 1;

        // Calculate resolution time (if resolvedAt exists)
        if (issue.resolvedAt && issue.createdAt) {
          const createdAt = new Date(issue.createdAt).getTime();
          const resolvedAt = new Date(issue.resolvedAt).getTime();
          const resolutionTime = resolvedAt - createdAt;

          // Only add positive resolution times
          if (resolutionTime > 0) {
            stats.totalResolutionTime += resolutionTime;
          }
        }
      } else {
        stats.openIssues += 1;
      }
    });

    const propertiesWithStats: PropertyWithStats[] = properties.map(
      (property) => {
        const stats = statsMap.get(property.id)!;

        // Calculate average resolution time in hours
        const avgResolutionTime =
          stats.resolvedIssues > 0
            ? Math.round(
                (stats.totalResolutionTime /
                  stats.resolvedIssues /
                  (1000 * 60 * 60)) *
                  10,
              ) / 10 // Convert ms to hours, 1 decimal
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

    return propertiesWithStats;
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
): Promise<PropertyWithStats[]> {
  return fetchPropertiesWithStats(uid);
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
