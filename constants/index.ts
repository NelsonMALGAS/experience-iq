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
  Clock,
  Activity,
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
          ? "https://buy.stripe.com/test_7sYaEXbggaRR4Ei7neenS0h"
          : "PROD_PAYMENT_LINK_STARTER_MONTHLY",
      },
      yearly: {
        price: 11520,
        priceId: isDevelopment
          ? "price_1T3vgLGanontDcTun1I3jrE4"
          : "PROD_PRICE_ID_STARTER_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_14A6oHckkbVV6Mq36YenS0l"
          : "PROD_PAYMENT_LINK_STARTER_YEARLY",
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
          ? "https://buy.stripe.com/test_00waEX5VW1hhfiWgXOenS0i"
          : "PROD_PAYMENT_LINK_GROWTH_MONTHLY",
      },
      yearly: {
        price: 24000,
        priceId: isDevelopment
          ? "price_1T3vk0GanontDcTu4y3lRzWv"
          : "PROD_PRICE_ID_GROWTH_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_cNi28r4RS9NN1s66jaenS0m"
          : "PROD_PAYMENT_LINK_GROWTH_YEARLY",
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
          ? "https://buy.stripe.com/test_9B6cN5ess0dd2waePGenS0j"
          : "PROD_PAYMENT_LINK_PRO_MONTHLY",
      },
      yearly: {
        price: 35520,
        priceId: isDevelopment
          ? "price_1T3vnEGanontDcTufvnhGIZX"
          : "PROD_PRICE_ID_PRO_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_bJeaEXacc3pp7Qu0YQenS0n"
          : "PROD_PAYMENT_LINK_PRO_YEARLY",
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
          ? "https://buy.stripe.com/test_dRmaEX4RS0ddfiWfTKenS0k"
          : "PROD_PAYMENT_LINK_ENTERPRISE_MONTHLY",
      },
      yearly: {
        price: 72000,
        priceId: isDevelopment
          ? "price_1T3vqGGanontDcTuc3fnsOeI"
          : "PROD_PRICE_ID_ENTERPRISE_YEARLY",
        paymentLink: isDevelopment
          ? "https://buy.stripe.com/test_6oU5kD1FGe43eeSePGenS0o"
          : "PROD_PAYMENT_LINK_ENTERPRISE_YEARLY",
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

export const years = Array.from(
  { length: 11 },
  (_, i) => new Date().getFullYear() + i,
);
