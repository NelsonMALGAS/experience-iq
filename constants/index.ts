import { IssueCategory, Role } from "@/types";
import {
  LayoutDashboard,
  AlertCircle,
  PlusCircle,
  ClipboardList,
  Building2,
  Users,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_LINKS: Record<"guest" | "staff" | "admin", NavLink[]> = {
  guest: [
    { label: "Dashboard", href: "/guest", icon: LayoutDashboard },
    { label: "My Issues", href: "/guest/issues", icon: AlertCircle },
    { label: "Report Issue", href: "/guest/add-issue", icon: PlusCircle },
  ],
  staff: [
    { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { label: "Assigned Issues", href: "/staff/issues", icon: ClipboardList },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Properties", href: "/admin/properties", icon: Building2 },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Roster", href: "/admin/create-roster", icon: CalendarClock },
  ],
} as const;

export const ISSUE_CATEGORIES = [
  { value: "room", label: "Room Issue", icon: "🛏️" },
  { value: "food", label: "Food & Beverage", icon: "🍽️" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "noise", label: "Noise Complaint", icon: "🔊" },
  { value: "cleanliness", label: "Cleanliness", icon: "🧹" },
  { value: "amenities", label: "Amenities", icon: "🏊" },
  { value: "billing", label: "Billing", icon: "💳" },
  { value: "staff", label: "Staff Service", icon: "👤" },
  { value: "other", label: "Other", icon: "📝" },
] as const;

export const ISSUE_PRIORITIES = [
  { value: "low", label: "Low", color: "priority-low" },
  { value: "medium", label: "Medium", color: "priority-medium" },
  { value: "high", label: "High", color: "priority-high" },
  { value: "critical", label: "Critical", color: "priority-critical" },
] as const;

export const ISSUE_STATUSES = [
  { value: "open", label: "Open", color: "status-open" },
  { value: "in_progress", label: "In Progress", color: "status-progress" },
  { value: "resolved", label: "Resolved", color: "status-resolved" },
] as const;

export const roles: Role[] = ["guest", "admin", "staff"];

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const roleConfig = {
  guest: { label: "Guest", color: "bg-blue-100 text-blue-700 border-blue-200" },
  staff: {
    label: "Staff",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  admin: {
    label: "Admin",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const shiftTemplates = [
  {
    label: "Morning",
    start: "06:00",
    end: "14:00",
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  },
  {
    label: "Afternoon",
    start: "14:00",
    end: "22:00",
    color: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  },
  {
    label: "Night",
    start: "22:00",
    end: "06:00",
    color: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  },
  {
    label: "Full Day",
    start: "09:00",
    end: "17:00",
    color: "bg-green-500/20 text-green-700 dark:text-green-300",
  },
];

export const staffColorPalette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const STAFF_DEPARTMENTS: IssueCategory[] = [
  "amenities",
  "billing",
  "cleanliness",
  "food",
  "maintenance",
  "noise",
  "room",
  "security",
  "staff",
  "other",
];
