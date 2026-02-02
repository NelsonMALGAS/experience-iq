import { User } from "firebase/auth";

export type PwaModalProps = {
  onInstall: () => void;
  onClose: () => void;
  show: boolean;
};

export type Role = "admin" | "staff" | "guest";
export interface Property {
  id: string;
  name: string;
  location: string;
  totalIssues: number;
  openIssues: number;
  avgResolutionTime: number;
  resolvedIssues: number;
}

type BaseAppUser = Partial<User> & {
  uid: string;
  role: Role;
  isVerified: boolean;
};

export type GuestUser = BaseAppUser & {
  role: "guest";
  property: null;
};

export type StaffUser = BaseAppUser & {
  role: "staff";
  property: [Property]; // exactly one
};

export type AdminUser = BaseAppUser & {
  role: "admin";
  property: Property[]; // one or more
};

export type AppUser = GuestUser | StaffUser | AdminUser;

export type IssueStatus = "open" | "in_progress" | "resolved";

export type IssuePriority = "low" | "medium" | "high" | "critical";

export type IssueCategory =
  | "room"
  | "food"
  | "maintenance"
  | "noise"
  | "cleanliness"
  | "amenities"
  | "billing"
  | "staff"
  | "other";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  guestId: string;
  guestName?: string;
  roomNumber?: string;
  assignedTo?: string;
  assignedToName?: string;
  propertyId: string;
  propertyName?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  isAnonymous: boolean;
  images?: string[];
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResolutionTime: string;
  slaCompliance: number;
}

export interface IssueCollection {
  id: string;
  guestId: string;
  issues: Issue[];
  updatedAt: Date;
}
