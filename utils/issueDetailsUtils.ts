import { Issue } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { Timestamp } from "firebase/firestore";

type DateInput =
  | string
  | Date
  | Timestamp
  | { _seconds: number; _nanoseconds: number };

export const toDate = (value: DateInput): Date | null => {
  try {
    if (!value) return null;

    // Firestore Timestamp instance
    if (value instanceof Timestamp) {
      return value.toDate();
    }

    // Firestore timestamp-like object
    if (
      typeof value === "object" &&
      "_seconds" in value &&
      typeof value._seconds === "number"
    ) {
      return new Date(value._seconds * 1000);
    }

    // ISO string or Date
    return new Date(value.toString());
  } catch {
    return null;
  }
};

// Status badge configuration
export const getStatusConfig = (status: Issue["status"]) => {
  const configs = {
    open: {
      label: "Open",
      variant: "destructive" as const,
      className: "bg-status-open-bg text-status-open border-status-open",
    },
    in_progress: {
      label: "In Progress",
      variant: "default" as const,
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    resolved: {
      label: "Resolved",
      variant: "outline" as const,
      className:
        "bg-status-resolved-bg text-status-resolved border-status-resolved",
    },
  };
  return configs[status] || configs.open;
};

// Priority badge configuration
export const getPriorityConfig = (priority: Issue["priority"]) => {
  const configs = {
    critical: {
      label: "Critical",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-700 border-red-300",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    high: {
      label: "High",
      variant: "destructive" as const,
      className: "bg-orange-100 text-orange-700 border-orange-300",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    medium: {
      label: "Medium",
      variant: "default" as const,
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    low: {
      label: "Low",
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-700 border-gray-300",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  };
  return configs[priority] || configs.medium;
};

// Timeline event generation
export interface TimelineEvent {
  id: string;
  type: "created" | "assigned" | "status_change" | "resolved";
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export const generateTimeline = (issue: Issue): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Created event
  events.push({
    id: `${issue.id}-created`,
    type: "created",
    title: "Issue Created",
    description: `Reported by ${issue.guestName || "Guest"}`,
    timestamp: toDate(issue.createdAt) || new Date(issue.createdAt),
    icon: "plus",
  });

  // Assignment event
  if (issue.assignedToName && issue.createdAt) {
    events.push({
      id: `${issue.id}-assigned`,
      type: "assigned",
      title: "Issue Assigned",
      description: `Assigned to ${issue.assignedToName}`,
      timestamp: toDate(issue.createdAt) || new Date(issue.createdAt),
      icon: "user-check",
    });
  }

  // Status change events (if tracked)
  if (issue.status === "in_progress" && issue.updatedAt) {
    events.push({
      id: `${issue.id}-progress`,
      type: "status_change",
      title: "Work Started",
      description: "Issue status changed to In Progress",
      timestamp: toDate(issue.updatedAt) || new Date(issue.updatedAt),
      icon: "play",
    });
  }

  // Resolved event
  if (issue.status === "resolved" && issue.resolvedAt) {
    events.push({
      id: `${issue.id}-resolved`,
      type: "resolved",
      title: "Issue Resolved",
      description: `Resolved by ${issue.assignedToName || "Staff"}`,
      timestamp: new Date(issue.resolvedAt),
      icon: "check-circle",
    });
  }

  // Sort by timestamp
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Date formatting utilities
export const formatRelativeTime = (date: DateInput): string => {
  const parsedDate = toDate(date);

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

export const formatFullDate = (date: DateInput): string => {
  const parsedDate = toDate(date);

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return format(parsedDate, "PPpp");
};

// Category icon mapping
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    maintenance: "wrench",
    housekeeping: "sparkles",
    amenity: "coffee",
    safety: "shield-alert",
    noise: "volume-2",
    other: "help-circle",
  };
  return icons[category.toLowerCase()] || "help-circle";
};
