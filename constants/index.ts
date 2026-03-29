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

export const isDevelopment = process.env.NODE_ENV === "development";
//export const isDevelopment = true;

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

export const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using ExperienceIQ ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform. These Terms apply to all users, including guests, staff members, administrators, and property owners.`,
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `ExperienceIQ is a real-time guest experience and service recovery platform designed for hospitality operators. The Platform enables guests to report issues, staff to manage and resolve those issues, and administrators to monitor operations across one or more properties. Features include QR-based issue reporting, SLA tracking, staff roster management, analytics dashboards, and multi-property administration.`,
  },
  {
    id: "roles",
    title: "3. User Roles & Access",
    content: `The Platform operates under a role-based access model:

• Guests may report issues and track resolution status without creating an account, using a property-specific QR code or access code.
• Staff members must register and be verified by an administrator before gaining operational access. Staff access is scoped to their assigned administrator's properties.
• Administrators manage staff, properties, and issue operations. Administrators may invite verified collaborator admins with scoped, property-level access only.
• Property Owners hold governance authority over billing, subscriptions, and access provisioning. Owner credentials may not be shared or transferred.

Access at each level is enforced server-side. Attempting to circumvent role restrictions is a material breach of these Terms.`,
  },
  {
    id: "accounts",
    title: "4. Account Registration & Security",
    content: `You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account. ExperienceIQ is not liable for any loss or damage arising from your failure to protect your credentials. Accounts may not be shared between individuals.`,
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use",
    content: `You agree not to:

• Submit false, misleading, or fraudulent issue reports
• Attempt to access accounts, data, or systems you are not authorised to access
• Reverse engineer, decompile, or attempt to extract the Platform's source code
• Use the Platform to transmit malware, spam, or harmful content
• Interfere with or disrupt the integrity or performance of the Platform
• Use automated tools to scrape, crawl, or extract data from the Platform without written authorisation
• Circumvent any technical measures that control access to features or data

ExperienceIQ reserves the right to suspend or terminate access for any user who violates these provisions.`,
  },
  {
    id: "subscription",
    title: "6. Subscription & Billing",
    content: `Access to certain features of the Platform requires a paid subscription, managed by the property owner. Billing is processed through Paystack, a third-party payment provider. By subscribing, you authorise ExperienceIQ to charge your selected payment method on a recurring basis according to your chosen plan.

Subscription state is the source of truth for platform access. ExperienceIQ reserves the right to suspend access if payment fails or a subscription lapses. Refunds are not provided for partial billing periods unless required by applicable law.

All payment data is handled server-side via Paystack and is never stored or exposed by the ExperienceIQ Platform.`,
  },
  {
    id: "data",
    title: "7. Data & Privacy",
    content: `ExperienceIQ collects and processes operational data — including issue reports, staff activity, and usage analytics — to deliver and improve the Platform. By using the Platform, you consent to this processing.

Guest issue data is scoped to the relevant property and accessible only to that property's authorised administrators and staff. ExperienceIQ does not sell user data to third parties.

For full details on data handling, please review our Privacy Policy.`,
  },
  {
    id: "ip",
    title: "8. Intellectual Property",
    content: `All content, software, design, trademarks, and technology comprising the ExperienceIQ Platform are the exclusive property of ExperienceIQ and are protected by applicable intellectual property laws. These Terms do not grant you any ownership rights in the Platform.

You retain ownership of any data you submit to the Platform. By submitting data, you grant ExperienceIQ a limited, non-exclusive licence to process that data solely for the purpose of providing the service.`,
  },
  {
    id: "availability",
    title: "9. Service Availability",
    content: `ExperienceIQ aims to maintain high availability but does not guarantee uninterrupted access. The Platform may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will endeavour to provide advance notice of planned downtime where possible.

ExperienceIQ is not liable for any loss or inconvenience caused by Platform unavailability.`,
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, ExperienceIQ and its affiliates, directors, employees, and service providers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform.

ExperienceIQ's total liability for any claim arising under these Terms shall not exceed the amount paid by you to ExperienceIQ in the three months preceding the claim.`,
  },
  {
    id: "termination",
    title: "11. Termination",
    content: `ExperienceIQ reserves the right to suspend or terminate your access to the Platform at any time, with or without notice, for conduct that violates these Terms or is otherwise harmful to other users, ExperienceIQ, or third parties.

You may terminate your account at any time by contacting us. Upon termination, your right to access the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination — including intellectual property, limitation of liability, and governing law — will remain in effect.`,
  },
  {
    id: "changes",
    title: "12. Changes to These Terms",
    content: `ExperienceIQ reserves the right to update these Terms at any time. We will notify users of material changes via the Platform or by email. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.`,
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    content: `These Terms are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of South Africa.`,
  },
  {
    id: "contact",
    title: "14. Contact",
    content: `If you have questions about these Terms or the Platform, please contact us via the Contact page or reach out to our support team directly through the Platform.`,
  },
];

export const PRICE_PLANS: PricePlan[] = [
  {
    id: "starter",
    title: "Starter Plan",
    description:
      "Ideal for small hotels or boutique properties starting with digital guest experience management.",
    info: [
      "1 property included",
      "Up to 75 staff accounts",
      "1,000 guests/month included",
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
      "5,000 guests/month included.",
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
      "10,000 guests/month included.",
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
      "20,000 guests/month included",
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

/**
 *  {
    id: "test",
    title: "Test Plan",
    description:
      "Development-only plan to verify the full payment & webhook flow with a real live charge.",
    info: [
      "Same webhook flow as paid plans",
      "Triggers charge.success event",
      "Triggers subscription.create event",
      "Verifies live Paystack keys end-to-end",
      "R5 — refundable from dashboard",
    ],
    pricing: {
      monthly: {
        price: 5,
        priceId: "price_TEST_MONTHLY",
        planCode: "PLN_xo9qgxdhnpgmdt4",
      },
      yearly: {
        price: 5,
        priceId: "price_TEST_YEARLY",
        planCode: "PLN_xo9qgxdhnpgmdt4",
      },
    },
    limits: {
      propertyLimit: 1,
      staffLimit: 1,
    },
  },
 */
