import { Issue } from "@/types";

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

  // Resolved today count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const resolvedToday = assignedIssues.filter((issue) => {
    if (issue.status !== "resolved" || !issue.updatedAt) return false;
    const updatedDate = new Date(issue.updatedAt);
    updatedDate.setHours(0, 0, 0, 0);
    return updatedDate.getTime() === today.getTime();
  }).length;

  // Calculate average resolution time for resolved issues
  const resolvedIssues = assignedIssues.filter(
    (i) => i.status === "resolved" && i.createdAt && i.updatedAt,
  );

  let avgResolutionTime = "N/A";

  if (resolvedIssues.length > 0) {
    const totalMinutes = resolvedIssues.reduce((sum, issue) => {
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.updatedAt).getTime();
      const minutes = (resolved - created) / (1000 * 60);
      return sum + minutes;
    }, 0);

    const avgMinutes = totalMinutes / resolvedIssues.length;

    if (avgMinutes < 60) {
      avgResolutionTime = `${Math.round(avgMinutes)}m`;
    } else if (avgMinutes < 1440) {
      // Less than 24 hours
      const hours = avgMinutes / 60;
      avgResolutionTime = `${hours.toFixed(1)}h`;
    } else {
      const days = avgMinutes / 1440;
      avgResolutionTime = `${days.toFixed(1)}d`;
    }
  }

  // Calculate SLA compliance based on priority
  const slaThresholds = {
    critical: 4 * 60, // 4 hours in minutes
    high: 24 * 60, // 24 hours
    medium: 48 * 60, // 48 hours
    low: 72 * 60, // 72 hours
  };

  const resolvedWithinSLA = resolvedIssues.filter((issue) => {
    const created = new Date(issue.createdAt).getTime();
    const resolved = new Date(issue.updatedAt).getTime();
    const resolutionMinutes = (resolved - created) / (1000 * 60);
    const threshold =
      slaThresholds[issue.priority as keyof typeof slaThresholds] ||
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

export function generateRandomCode(length = 6): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789" +
    "!@#$%^&*_-+=";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
