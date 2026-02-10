import { Issue } from "@/types";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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

// Priority badge colors with enhanced styling
const getPriorityConfig = (priority: Issue["priority"]) => {
  switch (priority) {
    case "high":
      return {
        color:
          "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 dark:from-red-950/40 dark:to-rose-950/40 dark:text-red-400 border-red-300/60 dark:border-red-800/60 shadow-sm",
        label: "High Priority",
        dotColor: "bg-red-500",
      };
    case "medium":
      return {
        color:
          "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 dark:from-amber-950/40 dark:to-yellow-950/40 dark:text-amber-400 border-amber-300/60 dark:border-amber-800/60 shadow-sm",
        label: "Medium Priority",
        dotColor: "bg-amber-500",
      };
    case "low":
      return {
        color:
          "bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 dark:from-blue-950/40 dark:to-sky-950/40 dark:text-blue-400 border-blue-300/60 dark:border-blue-800/60 shadow-sm",
        label: "Low Priority",
        dotColor: "bg-blue-500",
      };
    default:
      return {
        color:
          "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 dark:from-slate-950/40 dark:to-gray-950/40 dark:text-slate-400 border-slate-300/60 dark:border-slate-800/60",
        label: "Standard",
        dotColor: "bg-slate-500",
      };
  }
};

// Status badge colors and icons with enhanced styling
const getStatusConfig = (status: Issue["status"]) => {
  switch (status) {
    case "open":
      return {
        color:
          "bg-gradient-to-r from-slate-50 to-zinc-50 text-slate-700 dark:from-slate-900/60 dark:to-zinc-900/60 dark:text-slate-300 border-slate-300/70 dark:border-slate-700/70",
        icon: AlertCircle,
        label: "Open",
        ringColor: "ring-slate-200 dark:ring-slate-800",
      };
    case "in_progress":
      return {
        color:
          "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-900/60 dark:to-cyan-900/60 dark:text-blue-300 border-blue-300/70 dark:border-blue-700/70",
        icon: Loader2,
        label: "In Progress",
        ringColor: "ring-blue-200 dark:ring-blue-800",
      };
    case "resolved":
      return {
        color:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:from-green-900/60 dark:to-emerald-900/60 dark:text-green-300 border-green-300/70 dark:border-green-700/70",
        icon: CheckCircle2,
        label: "Resolved",
        ringColor: "ring-green-200 dark:ring-green-800",
      };
    default:
      return {
        color:
          "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 dark:from-gray-900/60 dark:to-slate-900/60 dark:text-gray-300 border-gray-300/70 dark:border-gray-700/70",
        icon: AlertCircle,
        label: "Unknown",
        ringColor: "ring-gray-200 dark:ring-gray-800",
      };
  }
};

export {
  aggregateByCategory,
  calculateAvgResolutionTime,
  calculateSLACompliance,
  staffColorPalette,
  getPriorityConfig,
  getStatusConfig,
};
