import { shiftTemplates } from "@/constants";
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type PwaModalProps = {
  onInstall: () => void;
  onClose: () => void;
  show: boolean;
};

export type IssueDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export type Role = "admin" | "staff" | "guest";

export interface Room {
  id: string;
  roomNumber: string;
  status: "available" | "occupied" | "maintenance";
  createdAt: Date;
}
export interface Property {
  id: string;
  name: string;
  location: string;
  totalIssues: number;
  openIssues: number;
  avgResolutionTime: number;
  resolvedIssues: number;
  code: string;
  rooms: Room[];
  createdAt?: Date;
}

/**
 * Guest session data stored in localStorage
 */
export interface GuestSession {
  uid: string;
  role: "guest";
  propertyId: string;
  propertyName: string;
  propertyLocation: string | null;
  roomId: string;
  roomNumber: string;
}

/**
 * Room code validation result
 */
export interface RoomCodeValidation {
  isValid: boolean;
  property?: Property;
  room?: Room;
  error?: string;
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
  propertyLocation?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
  isAnonymous: boolean;
  images?: string[];
  read?: boolean | null;
  readBy?: string[];
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
  role: Role;
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
  id?: string;
  month: string;
  year: number;
  shifts: Shift[];
  createdBy: string;
  createdAt: string;
}

export type DateInput =
  | Date
  | string
  | Timestamp
  | { _seconds: number; _nanoseconds: number }
  | null
  | undefined;

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

export interface CreatePropertyData {
  name: string;
  location: string;
  code: string;
  rooms: Room[];
}

/**
 * Property update payload
 */
export interface UpdatePropertyData {
  name?: string;
  location?: string;
  code: string;
  totalIssues?: number;
  openIssues?: number;
  avgResolutionTime?: number;
}

export interface UpdateIssuePayload {
  assignedTo?: string;
  assignedToName?: string;
  status?: Issue["status"];
  propertyId?: string;
  priority?: Issue["priority"];
}
