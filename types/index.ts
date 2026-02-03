import { shiftTemplates } from "@/constants";
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
  property: [Property];
  department: IssueCategory;
};

export type AdminUser = BaseAppUser & {
  role: "admin";
  property: Property[]; // one or more
};

export type AppUser = GuestUser | StaffUser | AdminUser;

export type IssueStatus = "open" | "in_progress" | "resolved";

export type IssuePriority = "low" | "medium" | "high" | "critical";

export type IssueCategory =
  | "management"
  | "room"
  | "food"
  | "maintenance"
  | "noise"
  | "cleanliness"
  | "amenities"
  | "billing"
  | "staff"
  | "security"
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

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: IssueCategory | null;
  color: string;
  isVerified: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface RosterData {
  month: string;
  year: number;
  shifts: Shift[];
  createdBy: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  color: string;
}

export interface Shift {
  id: string;
  staffId: string;
}

export interface ShiftTemplate {
  label: string;
  end: string;
  start: string;
  color: string;
}

export interface CalendarGridProps {
  firstDay: number;
  daysInMonth: number;
  selectedYear: number;
  selectedMonth: number;
  selectedDate: string;
  selectedStaff: string;

  staffMembers: StaffMember[];
  shiftTemplates: ShiftTemplate[];

  isMobileMenuOpen: boolean;

  getShiftsForDate: (date: string) => Shift[];
  setSelectedDate: (date: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  removeShift: (shiftId: string) => void;
  quickAddShift: (day: number, template: ShiftTemplate) => void;
  rangeStart: string | null;
  rangeEnd: string | null;
  isDraggingRange: boolean;
  setIsDraggingRange: (val: boolean) => void;
  onDateSelect: (date: string) => void;
  isDateInRange: (date: string) => boolean;
  selectedTemplate: (typeof shiftTemplates)[0] | null;
  setSelectedTemplate: (t: (typeof shiftTemplates)[0]) => void;
}
