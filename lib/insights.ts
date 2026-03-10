import { Issue, Property } from "@/types";
import { toDate } from "@/utils/issueDetailsUtils";
import { formatDistanceToNow } from "date-fns";

/**
 * AI-style operational insights derived from real data patterns.
 */
export function deriveAiInsights(
  issues: Issue[],
): { id: string; insight: string }[] {
  const insights: { id: string; insight: string }[] = [];

  if (issues.length === 0) {
    insights.push({
      id: "no_data",
      insight:
        "No issue data available yet. Insights will appear as guests report issues.",
    });
    return insights;
  }

  // Room range with most issues
  const roomCounts: Record<string, number> = {};
  for (const issue of issues) {
    if (issue.roomNumber) {
      roomCounts[issue.roomNumber] = (roomCounts[issue.roomNumber] ?? 0) + 1;
    }
  }
  const topRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0];
  if (topRoom && topRoom[1] > 1) {
    insights.push({
      id: "insight_room",
      insight: `Room ${topRoom[0]} has the highest number of reported issues (${topRoom[1]}). Consider a maintenance inspection.`,
    });
  }

  // Category with most open issues
  const categoryCounts: Record<string, number> = {};
  for (const issue of issues.filter((i) => i.status !== "resolved")) {
    categoryCounts[issue.category] = (categoryCounts[issue.category] ?? 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (topCategory) {
    insights.push({
      id: "insight_category",
      insight: `"${topCategory[0]}" is the most common unresolved issue category with ${topCategory[1]} open item${topCategory[1] > 1 ? "s" : ""}.`,
    });
  }

  // Unread issues
  const unread = issues.filter(
    (i) => !i.read && i.status !== "resolved",
  ).length;
  if (unread > 0) {
    insights.push({
      id: "insight_unread",
      insight: `${unread} unresolved issue${unread > 1 ? "s have" : " has"} not been read by any staff member yet.`,
    });
  }

  // Avg resolution time warning
  const avgTime = deriveAvgResponseTime(issues);
  if (avgTime > 120) {
    insights.push({
      id: "insight_slow",
      insight: `Average resolution time is ${avgTime} minutes. Consider reviewing staffing or escalation workflows.`,
    });
  }

  // High open ratio
  const openRatio =
    issues.filter((i) => i.status !== "resolved").length / issues.length;
  if (openRatio > 0.4) {
    insights.push({
      id: "insight_open_ratio",
      insight: `${Math.round(openRatio * 100)}% of all issues remain unresolved. Staff workload or SLA rules may need review.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "insight_ok",
      insight:
        "Operations are running smoothly. No significant patterns detected.",
    });
  }

  return insights;
}

/**
 * Resolution rate expressed as a 0–5 satisfaction score.
 * 100% resolution → 5.0, 0% resolution → 1.0
 */
export function deriveOverallSatisfaction(issues: Issue[]): number {
  if (issues.length === 0) return 5.0;
  const resolved = issues.filter((i) => i.status === "resolved").length;
  const rate = resolved / issues.length;
  const score = 1 + rate * 4;
  return Math.round(score * 10) / 10;
}

/**
 * Average resolution time in minutes across all resolved issues.
 * Falls back to 0 if no resolved issues exist.
 */
export function deriveAvgResponseTime(issues: Issue[]): number {
  const resolved = issues.filter(
    (i) => i.status === "resolved" && i.resolvedAt != null,
  );
  if (resolved.length === 0) return 0;

  const totalMinutes = resolved.reduce((sum, issue) => {
    const created = toDate(issue.createdAt)?.getTime() ?? 0;
    const resolvedAt = toDate(issue.resolvedAt)?.getTime() ?? 0;
    return sum + (resolvedAt - created) / 60_000;
  }, 0);

  return Math.round(totalMinutes / resolved.length);
}

/**
 * Sentiment risk based on the ratio of open high-priority issues.
 */
export function deriveSentimentRisk(
  issues: Issue[],
): "low" | "medium" | "high" | "critical" {
  if (issues.length === 0) return "low";
  const openHigh = issues.filter(
    (i) => i.status !== "resolved" && i.priority === "high",
  ).length;
  const ratio = openHigh / issues.length;
  if (ratio >= 0.2) return "high";
  if (ratio >= 0.08) return "medium";
  return "low";
}

/**
 * Critical alerts: open issues with high or critical priority,
 * sorted by most recently created, capped at 5.
 */
export function deriveCriticalAlerts(issues: Issue[], properties: Property[]) {
  // Build a quick lookup map so we don't iterate properties for every issue
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  return issues
    .filter(
      (i) =>
        i.status !== "resolved" &&
        (i.priority === "high" || i.priority === "critical"),
    )
    .sort(
      (a, b) =>
        (toDate(b.createdAt)?.getTime() ?? 0) -
        (toDate(a.createdAt)?.getTime() ?? 0),
    )
    .slice(0, 5)
    .map((i) => {
      const createdDate = toDate(i.createdAt);
      const property = propertyMap.get(i.propertyId);
      return {
        id: i.id,
        guest: i.guestName ?? "Guest",
        roomNumber: i.roomNumber ?? "—",
        issue: i.title,
        severity: i.priority as "high" | "critical",
        reportedMinutesAgo: createdDate
          ? formatDistanceToNow(createdDate, { addSuffix: true })
          : "just now",
        status: i.status,
        propertyName: property?.name ?? "Unknown Property",
        propertyLocation: property?.location ?? "—",
      };
    });
}

export function severityClass(severity: "high" | "critical"): string {
  return severity === "critical"
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-orange-100 text-orange-800 border-orange-200";
}
