import { Issue } from "@/types";

export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResolutionTime: string;
  slaCompliance: number;
}

interface Property {
  id: string;
  name: string;
  location: string;
  openIssues: number;
  totalIssues: number;
}

export function calculateDashboardStats(issues: Issue[]): DashboardStats {
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status === "open").length;
  const inProgressIssues = issues.filter(
    (i) => i.status === "in_progress",
  ).length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length;

  // Calculate average resolution time for resolved issues
  const resolvedWithTimestamps = issues.filter(
    (i) => i.status === "resolved" && i.createdAt && i.updatedAt,
  );

  let avgResolutionTime = "N/A";

  if (resolvedWithTimestamps.length > 0) {
    const totalMinutes = resolvedWithTimestamps.reduce((sum, issue) => {
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.updatedAt).getTime();
      const minutes = (resolved - created) / (1000 * 60);
      return sum + minutes;
    }, 0);

    const avgMinutes = totalMinutes / resolvedWithTimestamps.length;

    if (avgMinutes < 60) {
      avgResolutionTime = `${Math.round(avgMinutes)}m`;
    } else if (avgMinutes < 1440) {
      const hours = avgMinutes / 60;
      avgResolutionTime = `${hours.toFixed(1)}h`;
    } else {
      const days = avgMinutes / 1440;
      avgResolutionTime = `${days.toFixed(1)}d`;
    }
  }

  const slaThresholds = {
    critical: 4 * 60,
    high: 24 * 60,
    medium: 48 * 60,
    low: 72 * 60,
  };

  const resolvedIssuesWithSLA = resolvedWithTimestamps.filter((issue) => {
    const created = new Date(issue.createdAt).getTime();
    const resolved = new Date(issue.updatedAt).getTime();
    const resolutionMinutes = (resolved - created) / (1000 * 60);
    const threshold =
      slaThresholds[issue.priority as keyof typeof slaThresholds] ||
      slaThresholds.medium;
    return resolutionMinutes <= threshold;
  });

  const slaCompliance =
    resolvedWithTimestamps.length > 0
      ? Math.round(
          (resolvedIssuesWithSLA.length / resolvedWithTimestamps.length) * 100,
        )
      : 100;

  return {
    totalIssues,
    openIssues,
    inProgressIssues,
    resolvedIssues,
    avgResolutionTime,
    slaCompliance,
  };
}

export function aggregatePropertyStats(issues: Issue[]): Property[] {
  const propertyMap = new Map<string, Property>();

  issues.forEach((issue) => {
    const propertyId = issue.propertyId;
    const propertyName = issue.propertyName || "Unknown Property";

    if (!propertyMap.has(propertyId)) {
      propertyMap.set(propertyId, {
        id: propertyId,
        name: propertyName,
        location: issue.roomNumber || "Unknown",
        openIssues: 0,
        totalIssues: 0,
      });
    }

    const property = propertyMap.get(propertyId)!;
    property.totalIssues += 1;

    if (issue.status === "open" || issue.status === "in_progress") {
      property.openIssues += 1;
    }
  });

  return Array.from(propertyMap.values()).sort(
    (a, b) => b.totalIssues - a.totalIssues,
  );
}
