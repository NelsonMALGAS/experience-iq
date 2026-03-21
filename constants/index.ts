import { AdminPermissions, IssueCategory, Role } from "@/types";
import {
  LayoutDashboard,
  AlertCircle,
  PlusCircle,
  ClipboardList,
  Building2,
  CalendarClock,
  Clock,
  Activity,
  BarChart3,
  UserCheck,
  UserPlus,
  MailCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// TODO: Environment-aware pricing configuration,Remember to change for production
//export const isDevelopment = process.env.NODE_ENV === "development";
export const isDevelopment = true;

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export type BillingInterval = "monthly" | "yearly";

export type PlanLimits = {
  propertyLimit: number;
  staffLimit: number;
};

export type PlanPricing = {
  price: number;
  priceId: string;
  planCode: string;
};

export type PricePlan = {
  id: string;
  title: string;
  description: string;
  info: string[];
  limits: PlanLimits;
  pricing: {
    monthly: PlanPricing;
    yearly: PlanPricing;
  };
};

export const PRICE_PLANS: PricePlan[] = [
  {
    id: "starter",
    title: "Starter Plan",
    description:
      "Ideal for small hotels or boutique properties starting with digital guest experience management.",
    info: [
      "1 property included",
      "Up to 75 staff accounts",
      "Real-time guest issue reporting",
      "SLA tracking",
      "Admin dashboard",
      "Email support",
    ],
    pricing: {
      monthly: {
        price: 1700,
        priceId: isDevelopment
          ? "price_1T3vPAGanontDcTuDaUws5J1"
          : "price_1Qz8Zd7QpR5mL1YfC6s8TwKX",

        planCode: isDevelopment ? "PLN_3nb7rbuv1b1b38d" : "PLN_ou39wf0c03ophoo",
      },
      yearly: {
        price: 16320,
        priceId: isDevelopment
          ? "price_1T3vgLGanontDcTun1I3jrE4"
          : "price_1Qz8aE3UvB0kN9xT5Hc2JqPm",
        planCode: isDevelopment ? "PLN_3c2ez2b8vqkm9hb" : "PLN_a6rkxroyxlwb1hn",
      },
    },
    limits: {
      propertyLimit: 1,
      staffLimit: 75,
    },
  },
  {
    id: "growth",
    title: "Growth Plan",
    description:
      "Perfect for medium-sized hotels and resorts managing multiple properties.",
    info: [
      "Up to 3 properties",
      "Up to 225 staff accounts",
      "Advanced SLA escalation rules",
      "Staff performance analytics",
      "Monthly roster management",
      "Data export capabilities",
      "Priority email support",
    ],
    pricing: {
      monthly: {
        price: 3500,
        priceId: isDevelopment
          ? "price_1T3vSYGanontDcTusTMMUNXi"
          : "price_1Qz8bF6RwL2Vg8Pz3NqT0YdS",
        planCode: isDevelopment ? "PLN_eto6898kbwmw8e4" : "PLN_gf222dolnj9uyz5",
      },
      yearly: {
        price: 33600,
        priceId: isDevelopment
          ? "price_1T3vk0GanontDcTu4y3lRzWv"
          : "price_1Qz8cH9MxK4pD7aT1Vn6LfZB",
        planCode: isDevelopment ? "PLN_jrgvlduhr9psxt9" : "PLN_2z0x3u9f547iujk",
      },
    },
    limits: {
      propertyLimit: 3,
      staffLimit: 225,
    },
  },
  {
    id: "pro",
    title: "Pro Plan",
    description:
      "Designed for growing hospitality groups managing multiple properties and larger teams.",
    info: [
      "Up to 6 properties",
      "Up to 450 staff accounts",
      "Multi-property analytics",
      "Cross-property performance comparisons",
      "Custom SLA rules",
      "Automated escalation workflows",
      "Role & permission control",
      "Advanced reporting dashboards",
    ],
    pricing: {
      monthly: {
        price: 4800,
        priceId: isDevelopment
          ? "price_1T3vVoGanontDcTu5kDIA2RQ"
          : "price_1Qz8dJ2QwC5Yk8L0rT3mVpXs",
        planCode: isDevelopment ? "PLN_5ddl6x2su5fgvbe" : "PLN_c1dztbf7mwaal6n",
      },
      yearly: {
        price: 46080,
        priceId: isDevelopment
          ? "price_1T3vnEGanontDcTufvnhGIZX"
          : "price_1Qz8eL7TbP4nA1Zq9Hc6RkWd",
        planCode: isDevelopment ? "PLN_5pnosqjc3prvfjh" : "PLN_k4m0lot76p9t89x",
      },
    },
    limits: {
      propertyLimit: 6,
      staffLimit: 450,
    },
  },
  {
    id: "enterprise",
    title: "Enterprise Plan",
    description:
      "Built for large hospitality groups managing multiple properties, offering high capacity, advanced integrations, and enterprise-grade operational oversight.",
    info: [
      "Up to 12 properties",
      "Up to 900 staff accounts",
      "Dedicated account manager",
      "White-label branding (optional)",
      "API integrations",
      "Custom SLA configurations",
      "Advanced analytics & reporting",
      "Multi-property performance tracking",
    ],
    pricing: {
      monthly: {
        price: 9500,
        priceId: isDevelopment
          ? "price_1T3vYKGanontDcTuW103cZfG"
          : "price_1Qz8XbJkL2a9Fv7PmC4dR6Ty",
        planCode: isDevelopment ? "PLN_c3hpfblpswylt9x" : "PLN_0ebxbrx3bw5wy3p",
      },
      yearly: {
        price: 91200,
        priceId: isDevelopment
          ? "price_1T3vqGGanontDcTuc3fnsOeI"
          : "price_1Qz8YcN4sH8Wk3LpT9Vx2AbF",
        planCode: isDevelopment ? "PLN_aqbyo5rfh8uz0wn" : "PLN_ib0ljs4539yxk6d",
      },
    },
    limits: {
      propertyLimit: 12,
      staffLimit: 900,
    },
  },
];

export const NAV_LINKS: Record<"guest" | "staff" | "admin", NavLink[]> = {
  guest: [
    { label: "Dashboard", href: "/guest", icon: LayoutDashboard },
    { label: "Report Issue", href: "/guest/add-issue", icon: PlusCircle },
  ],
  staff: [
    { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { label: "Assigned Issues", href: "/staff/issues", icon: ClipboardList },
    { label: "Roster", href: "/staff/roster", icon: CalendarClock },
    { label: "My Performance", href: "/staff/my-performance", icon: Activity },
  ],
  admin: [
    { label: "Admin Governance", href: "/owner", icon: ShieldCheck },
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    {
      label: "Staff Approval",
      href: "/admin/staff-verification",
      icon: UserCheck,
    },
    { label: "Properties", href: "/admin/properties", icon: Building2 },
    { label: "Collaborators", href: "/admin/collaborators", icon: UserPlus },
    { label: "Invitations", href: "/admin/invitations", icon: MailCheck },
    { label: "Insights", href: "/admin/insights", icon: BarChart3 },
    { label: "Roster", href: "/admin/create-roster", icon: CalendarClock },
  ],
} as const;

export const ISSUE_CATEGORIES: {
  value: IssueCategory;
  label: string;
  icon: string;
}[] = [
  { value: "roomIssue", label: "Room Issue", icon: "🛏️" },
  { value: "housekeeping", label: "Housekeeping", icon: "🧹" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "foodAndBeverage", label: "Food & Beverage", icon: "🍽️" },
  { value: "noiseComplaint", label: "Noise Complaint", icon: "🔊" },
  { value: "checkInOut", label: "Check-in / Check-out", icon: "🛎️" },
  { value: "billingPayment", label: "Billing & Payment", icon: "💳" },
  { value: "staffService", label: "Staff Service", icon: "👤" },
  { value: "amenitiesFacilities", label: "Amenities & Facilities", icon: "🏊" },
  { value: "wifiInternet", label: "WiFi / Internet", icon: "📶" },
  { value: "securitySafety", label: "Security & Safety", icon: "🛡️" },
  { value: "casinoGaming", label: "Casino / Gaming", icon: "🎰" },
  { value: "parkingTransport", label: "Parking / Transport", icon: "🚗" },
  { value: "other", label: "Other", icon: "📝" },
];

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

export const placeholderAdminProperties = [
  {
    id: crypto.randomUUID(),
    name: "-",
    location: "-",
    totalIssues: 0,
    resolvedIssues: 0,
    openIssues: 0,
    avgResolutionTime: 0,
    code: "",
    rooms: [],
    ownerId: "placeholderUID",
  },
  {
    id: crypto.randomUUID(),
    name: "-",
    location: "-",
    totalIssues: 0,
    resolvedIssues: 0,
    openIssues: 0,
    avgResolutionTime: 0,
    code: "",
    rooms: [],
    ownerId: "placeholderUID",
  },
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
  "amenitiesFacilities",
  "billingPayment",
  "housekeeping",
  "foodAndBeverage",
  "maintenance",
  "noiseComplaint",
  "roomIssue",
  "securitySafety",
  "staffService",
  "casinoGaming",
  "checkInOut",
  "parkingTransport",
  "wifiInternet",
  "other",
];

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  roomIssue: "Room Issue",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  foodAndBeverage: "Food & Beverage",
  noiseComplaint: "Noise Complaint",
  checkInOut: "Check-in / Check-out",
  billingPayment: "Billing & Payment",
  staffService: "Staff Service",
  amenitiesFacilities: "Amenities & Facilities",
  wifiInternet: "WiFi / Internet",
  securitySafety: "Security & Safety",
  casinoGaming: "Casino / Gaming",
  parkingTransport: "Parking / Transport",
  other: "Other",
};

export const statusConfig = {
  open: {
    label: "Open",
    className: "bg-status-open-bg text-status-open border-status-open/20",
    dotColor: "bg-status-open",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-status-resolved-bg text-status-resolved border-status-resolved/20",
    dotColor: "bg-status-resolved",
  },
};

export const priorityConfig = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  low: {
    label: "Low",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: Clock,
  },
};

// Types for Experience Intelligence Dashboard

export interface ExperienceMetrics {
  overallSatisfaction: number;
  satisfactionTrend?: number; // Percentage change
  activeAlerts: number;
  avgResponseTime: number; // in minutes
  responseTimeTrend?: number; // Percentage change
  sentimentRisk: "low" | "medium" | "high";
}

export interface CriticalAlert {
  id: string;
  guest: string;
  roomNumber: string;
  issue: string;
  severity: "high" | "medium" | "low";
  reportedMinutesAgo: number;
  category?: "maintenance" | "housekeeping" | "service" | "noise" | "other";
  assignedTo?: string;
  status?: "pending" | "in_progress" | "resolved";
}

export interface AIInsight {
  id: string;
  insight: string;
  priority: "high" | "medium" | "low";
  category?: "operations" | "satisfaction" | "performance" | "trends";
  actionable?: boolean;
  timestamp?: Date;
}

export interface SentimentData {
  label: "positive" | "neutral" | "negative";
  value: number; // Percentage (0-100)
  count?: number; // Actual count of responses
  color: string; // Tailwind class
}

export interface SatisfactionTrendPoint {
  day: string; // e.g., "Mon", "Tue" or "2024-01-15"
  date?: Date;
  score: number; // 0-5
  totalResponses?: number;
}

export interface GuestIssue extends CriticalAlert {
  guestId?: string;
  propertyId?: string;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolutionTime?: number; // in minutes
  guestSatisfactionAfterResolution?: number;
}

export interface OperationalInsight extends AIInsight {
  affectedRooms?: string[];
  affectedShifts?: string[];
  impactScore?: number; // 0-100
  suggestedAction?: string;
}

// Response types for API calls
export interface ExperienceIntelligenceResponse {
  metrics: ExperienceMetrics;
  alerts: CriticalAlert[];
  insights: AIInsight[];
  sentimentBreakdown?: SentimentData[];
  satisfactionTrend?: SatisfactionTrendPoint[];
  lastUpdated: Date;
}

// Filter types for querying data
export interface ExperienceDataFilters {
  propertyId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  severity?: Array<"high" | "medium" | "low">;
  alertStatus?: Array<"pending" | "in_progress" | "resolved">;
  categories?: string[];
}

// Dashboard configuration
export interface DashboardConfig {
  refreshIntervalMs: number;
  alertThresholds: {
    critical: number;
    warning: number;
  };
  displayOptions: {
    showTrends: boolean;
    showAIInsights: boolean;
    maxAlertsDisplayed: number;
  };
}

export const DEFAULT_PERMISSIONS: AdminPermissions = {
  viewIssues: true,
  manageIssues: true,
  viewAnalytics: true,
  manageStaff: false,
  manageCollaborators: false,
};

export const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
  viewIssues: "View Issues",
  manageIssues: "Manage Issues",
  manageStaff: "Manage Staff",
  manageCollaborators: "Manage Collaborators",
  viewAnalytics: "View Analytics",
};

export const PERMISSION_DESCRIPTIONS: Record<keyof AdminPermissions, string> = {
  viewIssues: "Can view all guest issues on assigned properties",
  manageIssues: "Can update, assign, and resolve issues",
  manageStaff: "Can approve and manage staff accounts",
  manageCollaborators: "Can invite and revoke other collaborators",
  viewAnalytics: "Can access insights and performance analytics",
};

export const years = Array.from(
  { length: 11 },
  (_, i) => new Date().getFullYear() + i,
);
