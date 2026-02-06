import { Issue } from "@/types";
import { toDate } from "./issueDetailsUtils";
import { toMillis } from "./dashboardUtiils";

export interface StaffDashboardStats {
  myAssigned: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedToday: number;
  avgResolutionTime: string;
  slaCompliance: number;
}

export function calculateStaffStats(
  assignedIssues: Issue[],
  unassignedIssues: Issue[],
): StaffDashboardStats {
  // Basic counts
  const myAssigned = assignedIssues.length;
  const openIssues = unassignedIssues.length;
  const inProgressIssues = assignedIssues.filter(
    (i) => i.status === "in_progress",
  ).length;

  // ---- Resolved today ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resolvedToday = assignedIssues.filter((issue) => {
    if (issue.status !== "resolved") return false;
    if (issue.resolvedAt === null) return false;

    const resolvedDate = toDate(issue.resolvedAt);
    if (!resolvedDate) return false;

    resolvedDate.setHours(0, 0, 0, 0);
    return resolvedDate.getTime() === today.getTime();
  }).length;

  // ---- Resolved issues with valid timestamps only ----
  const resolvedIssues = assignedIssues.filter(
    (issue) =>
      issue.status === "resolved" &&
      issue.createdAt !== null &&
      issue.resolvedAt !== null,
  );

  // ---- Average resolution time ----
  let avgResolutionTime = "N/A";

  if (resolvedIssues.length > 0) {
    const totalMinutes = resolvedIssues.reduce((sum, issue) => {
      const created = toMillis(issue.createdAt);
      const resolved = toMillis(issue.resolvedAt);

      if (!created || !resolved || resolved < created) {
        return sum;
      }

      return sum + (resolved - created) / (1000 * 60);
    }, 0);

    const avgMinutes = totalMinutes / resolvedIssues.length;

    if (avgMinutes < 60) {
      avgResolutionTime = `${Math.round(avgMinutes)}m`;
    } else if (avgMinutes < 1440) {
      avgResolutionTime = `${(avgMinutes / 60).toFixed(1)}h`;
    } else {
      avgResolutionTime = `${(avgMinutes / 1440).toFixed(1)}d`;
    }
  }

  // ---- SLA compliance ----
  const slaThresholds = {
    critical: 4 * 60,
    high: 24 * 60,
    medium: 48 * 60,
    low: 72 * 60,
  };

  const resolvedWithinSLA = resolvedIssues.filter((issue) => {
    const created = toMillis(issue.createdAt);
    const resolved = toMillis(issue.resolvedAt);

    if (!created || !resolved || resolved < created) return false;

    const resolutionMinutes = (resolved - created) / (1000 * 60);
    const threshold =
      slaThresholds[issue.priority as keyof typeof slaThresholds] ??
      slaThresholds.medium;

    return resolutionMinutes <= threshold;
  });

  const slaCompliance =
    resolvedIssues.length > 0
      ? Math.round((resolvedWithinSLA.length / resolvedIssues.length) * 100)
      : 100;

  return {
    myAssigned,
    openIssues,
    inProgressIssues,
    resolvedToday,
    avgResolutionTime,
    slaCompliance,
  };
}

export function generateRandomCode(
  length = 6,
  groupSize = 3,
  separator = "-",
): string {
  // Exclude confusing characters: 0,O,1,I,L
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Optional: split into groups for readability, e.g., "ABC-DEF"
  if (groupSize && length > groupSize) {
    const regex = new RegExp(`.{1,${groupSize}}`, "g");
    return result.match(regex)?.join(separator) ?? result;
  }

  return result;
}
