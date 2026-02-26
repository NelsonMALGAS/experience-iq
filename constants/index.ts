import { IssueCategory, Role } from "@/types";
import {
  LayoutDashboard,
  AlertCircle,
  PlusCircle,
  ClipboardList,
  Building2,
  CalendarClock,
  type LucideIcon,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";

// Environment-aware pricing configuration
// const isDevelopment = process.env.NODE_ENV === "development";
const isDevelopment = true;

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
  price: number; // in ZAR
  priceId: string; // Stripe Price ID
  paymentLink: string;
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
      "Up to 10 staff accounts",
      "Real-time guest issue reporting",
      "Basic SLA tracking",
      "Admin dashboard",
      "Email support",
    ],
    pricing: {
      monthly: {
        price: 1200,
        priceId: isDevelopment
          ? "price_1T3vPAGanontDcTuDaUws5J1"
          : "PROD_PRICE_ID_STARTER_MONTHLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_8x228racc0dd7Qu4b2enS0p"
          : "PROD_PAYMENT_LINK_STARTER_MONTHLY",
        planCode: "PLN_f17rtp913f6lexf",
      },
      yearly: {
        price: 11520,
        priceId: isDevelopment
          ? "price_1T3vgLGanontDcTun1I3jrE4"
          : "PROD_PRICE_ID_STARTER_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_5kQdR99881hh3Ae8rienS0t"
          : "PROD_PAYMENT_LINK_STARTER_YEARLY",
        planCode: "PLN_2wa3mtf7ey6x6iq",
      },
    },
    limits: {
      propertyLimit: 1,
      staffLimit: 10,
    },
  },
  {
    id: "growth",
    title: "Growth Plan",
    description:
      "Perfect for medium-sized hotels and resorts managing multiple properties.",
    info: [
      "Up to 3 properties",
      "Up to 50 staff accounts",
      "Advanced SLA escalation rules",
      "Staff performance analytics",
      "Monthly roster management",
      "Data export capabilities",
      "Priority email support",
    ],
    pricing: {
      monthly: {
        price: 2500,
        priceId: isDevelopment
          ? "price_1T3vSYGanontDcTusTMMUNXi"
          : "PROD_PRICE_ID_GROWTH_MONTHLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_bJe3cv9885xxfiWgXOenS0q"
          : "PROD_PAYMENT_LINK_GROWTH_MONTHLY",
        planCode: "PLN_docx7po6h0t7c94",
      },
      yearly: {
        price: 24000,
        priceId: isDevelopment
          ? "price_1T3vk0GanontDcTu4y3lRzWv"
          : "PROD_PRICE_ID_GROWTH_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_6oU14n2JKcZZdaO8rienS0u"
          : "PROD_PAYMENT_LINK_GROWTH_YEARLY",
        planCode: "PLN_hbomofbn80mhae5",
      },
    },
    limits: {
      propertyLimit: 3,
      staffLimit: 50,
    },
  },
  {
    id: "pro",
    title: "Pro Plan",
    description:
      "Designed for growing hospitality groups managing multiple properties and larger teams.",
    info: [
      "Up to 8 properties",
      "Up to 200 staff accounts",
      "Multi-property analytics",
      "Cross-property performance comparisons",
      "Custom SLA rules",
      "Automated escalation workflows",
      "Role & permission control",
      "Advanced reporting dashboards",
    ],
    pricing: {
      monthly: {
        price: 3700,
        priceId: isDevelopment
          ? "price_1T3vVoGanontDcTu5kDIA2RQ"
          : "PROD_PRICE_ID_PRO_MONTHLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_28E28r1FG5xxfiW22UenS0r"
          : "PROD_PAYMENT_LINK_PRO_MONTHLY",
        planCode: "PLN_hwo0qmsz86e1ly2",
      },
      yearly: {
        price: 35520,
        priceId: isDevelopment
          ? "price_1T3vnEGanontDcTufvnhGIZX"
          : "PROD_PRICE_ID_PRO_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_8x26oHbgg0ddb2GbDuenS0v"
          : "PROD_PAYMENT_LINK_PRO_YEARLY",
        planCode: "PLN_7c3t1j0w4qo0j55",
      },
    },
    limits: {
      propertyLimit: 8,
      staffLimit: 200,
    },
  },
  {
    id: "enterprise",
    title: "Enterprise Plan",
    description:
      "Tailored for large hotel chains and hospitality groups needing unlimited scalability and advanced features.",
    info: [
      "Up to 200 properties",
      "Up to 4000 staff accounts",
      "Dedicated account manager",
      "White-label branding (optional)",
      "API integrations",
      "Custom SLA configurations",
      "Advanced analytics & reporting",
      "Multi-property performance tracking",
    ],
    pricing: {
      monthly: {
        price: 7500,
        priceId: isDevelopment
          ? "price_1T3vYKGanontDcTuW103cZfG"
          : "PROD_PRICE_ID_ENTERPRISE_MONTHLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_00w7sL1FG6BB8Uy8rienS0s"
          : "PROD_PAYMENT_LINK_ENTERPRISE_MONTHLY",
        planCode: "PLN_dljcw17884zbofc",
      },
      yearly: {
        price: 72000,
        priceId: isDevelopment
          ? "price_1T3vqGGanontDcTuc3fnsOeI"
          : "PROD_PRICE_ID_ENTERPRISE_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_00w5kD1FGbVV1s64b2enS0w"
          : "PROD_PAYMENT_LINK_ENTERPRISE_YEARLY",
        planCode: "PLN_6b2r7co1y4putgh",
      },
    },
    limits: {
      propertyLimit: 200,
      staffLimit: 4000,
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
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Properties", href: "/admin/properties", icon: Building2 },
    { label: "Insights", href: "/admin/insights", icon: BarChart3 },
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

export const years = Array.from(
  { length: 11 },
  (_, i) => new Date().getFullYear() + i,
);
