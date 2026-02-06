import { Issue } from "@/types";

function calculateAvgResolutionTime(issues: Issue[]): string {
  const resolvedIssues = issues.filter(
    (i) => i.status === "resolved" && i.resolvedAt && i.createdAt,
  );

  if (resolvedIssues.length === 0) return "—";

  const totalTime = resolvedIssues.reduce((sum, issue) => {
    const created = new Date(issue.createdAt).getTime();
    const resolved = new Date(issue.resolvedAt!).getTime();
    return sum + (resolved - created);
  }, 0);

  const avgMillis = totalTime / resolvedIssues.length;
  const hours = Math.round(avgMillis / (1000 * 60 * 60));

  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function calculateSLACompliance(issues: Issue[]): number {
  const resolvedIssues = issues.filter((i) => i.status === "resolved");

  if (resolvedIssues.length === 0) return 100;

  const slaTargets = {
    critical: 4 * 60 * 60 * 1000, // 4 hours
    high: 24 * 60 * 60 * 1000, // 24 hours
    medium: 72 * 60 * 60 * 1000, // 3 days
    low: 168 * 60 * 60 * 1000, // 7 days
  };

  const withinSLA = resolvedIssues.filter((issue) => {
    if (!issue.resolvedAt) return false;

    const resolutionTime =
      new Date(issue.resolvedAt).getTime() -
      new Date(issue.createdAt).getTime();
    const target =
      slaTargets[issue.priority as keyof typeof slaTargets] ||
      slaTargets.medium;

    return resolutionTime <= target;
  });

  return Math.round((withinSLA.length / resolvedIssues.length) * 100);
}

function aggregateByCategory(issues: Issue[]): Record<string, number> {
  const categories: Record<string, number> = {};

  issues.forEach((issue) => {
    const category = issue.category || "other";
    categories[category] = (categories[category] || 0) + 1;
  });

  return categories;
}

// Staff color palette (should match your constants)
const staffColorPalette = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B4B4",
  "#A8E6CF",
];

export {
  aggregateByCategory,
  calculateAvgResolutionTime,
  calculateSLACompliance,
  staffColorPalette,
};
