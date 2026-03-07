import { shiftTemplates } from "@/constants";
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type AdminType = "main" | "inherited";
export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "revoked";
export type AccessStatus = "active" | "revoked";

export type PwaModalProps = {
  onInstall: () => void;
  onClose: () => void;
  show: boolean;
};

export type IssueDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export type Role = "owner" | "admin" | "staff" | "guest";

export interface Room {
  id: string;
  roomNumber: string;
  status: "available" | "occupied" | "maintenance";
  createdAt: Date;
}
export interface Property {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  totalIssues: number;
  openIssues: number;
  avgResolutionTime: number;
  resolvedIssues: number;
  code: string;
  rooms: Room[];
  createdAt?: Date;
  collaboratorIds?: string[];
}

export interface PropertyPermissions {
  canViewIssues: boolean;
  canManageIssues: boolean;
  canViewStaff: boolean;
  canManageStaff: boolean;
  canViewAnalytics: boolean;
}

export interface PropertyAccessDocument {
  id: string;
  propertyId: string;
  propertyOwnerId: string;
  grantedToAdminId: string;
  grantedByAdminId: string;
  grantedAt: FirebaseFirestore.Timestamp;
  revokedAt?: FirebaseFirestore.Timestamp;
  status: "active" | "revoked";

  permissions: {
    canViewIssues: boolean;
    canManageIssues: boolean;
    canViewStaff: boolean;
    canManageStaff: boolean;
    canViewAnalytics: boolean;
  };
}

export interface AdminInvitationDocument {
  id: string;
  propertyId: string;
  propertyName: string;
  invitedByAdminId: string;
  invitedAdminId: string;
  invitedAdminEmail: string;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  createdAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;
  acceptedAt?: FirebaseFirestore.Timestamp;
  declinedAt?: FirebaseFirestore.Timestamp;
  permissions: PropertyAccessDocument["permissions"];
}

export interface SanitisedPropertyAccess {
  accessId: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  propertyCode: string;
  grantedAt: Date;
  permissions: PropertyPermissions;
  ownerDisplayName: string;
}

export interface AdminInvitation {
  id: string;
  propertyId: string;
  propertyName: string;
  invitedByAdminId: string;
  invitedAdminId: string;
  invitedAdminEmail: string;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  permissions: PropertyPermissions;
}

export interface EligibleAdminForInvite {
  uid: string;
  displayName: string;
  email: string;
  department?: string;
}

export interface AuditLogDocument {
  id: string;
  action:
    | "admin_invited"
    | "invitation_accepted"
    | "invitation_declined"
    | "invitation_expired"
    | "access_revoked"
    | "access_granted"
    | "unauthorized_access_attempt";
  performedByUid: string;
  targetAdminId?: string;
  propertyId?: string;
  invitationId?: string;
  metadata?: Record<string, unknown>;
  timestamp: FirebaseFirestore.Timestamp;
  ipAddress?: string;
}

export interface AuditLogEntry {
  action: string;
  performedByUid: string;
  targetAdminId?: string;
  propertyId?: string;
  invitationId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
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

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export type UserSubscription = {
  hasAccess?: boolean;
  subscriptionId?: string;
  customerId?: string;
  priceId?: string;
  currentPeriodStart?: number; // Unix timestamp
  currentPeriodEnd?: number; // Unix timestamp
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
};

type BaseAppUser = Partial<User> & {
  uid: string;
  role: Role;
  isVerified: boolean;
  subscription?: UserSubscription;
};

export type GuestUser = BaseAppUser & {
  role: "guest";
  property: null;
};

export type StaffUser = BaseAppUser & {
  role: "staff";
  property: [Property];
  department: IssueCategory;
  adminId?: string;
};

export type AdminUser = BaseAppUser & {
  role: "admin";
  property: Property[];
  adminType?: "main" | "inherited";
  inheritedFrom?: string;
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
  adminId?: string | null;
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
  ownerId: string;
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
