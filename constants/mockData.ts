import { Issue, Property, DashboardStats, AppUser } from "@/types";

export const mockProperties: Property[] = [
  {
    id: "prop-1",
    name: "Sun City Resort",
    location: "North West, SA",
    totalIssues: 145,
    openIssues: 12,
    avgResolutionTime: 45,
    resolvedIssues: 0,
  },
  {
    id: "prop-2",
    name: "Table Bay Hotel",
    location: "Cape Town, SA",
    totalIssues: 89,
    openIssues: 8,
    avgResolutionTime: 38,
    resolvedIssues: 0,
  },
  {
    id: "prop-3",
    name: "Maslow Time Square",
    location: "Pretoria, SA",
    totalIssues: 67,
    openIssues: 5,
    avgResolutionTime: 52,
    resolvedIssues: 0,
  },
  {
    id: "prop-4",
    name: "Boardwalk Hotel",
    location: "Port Elizabeth, SA",
    totalIssues: 112,
    openIssues: 15,
    avgResolutionTime: 41,
    resolvedIssues: 0,
  },
];
export const mockUsers: AppUser[] = [
  {
    uid: "1",
    displayName: "John Guest",
    email: "guest@example.com",
    role: "guest",
    property: null,
    isVerified: false,
  },
  {
    uid: "2",
    displayName: "Sarah Staff",
    email: "staff@example.com",
    role: "staff",
    property: [mockProperties[0]], // ✅ full Property object
    isVerified: false,
  },
  {
    uid: "3",
    displayName: "Admin User",
    email: "admin@example.com",
    role: "admin",
    property: [mockProperties[0], mockProperties[1]], // ✅ multiple
    isVerified: false,
  },
];

export const mockIssues: Issue[] = [
  {
    id: "issue-1",
    title: "Air conditioning not working",
    description:
      "The AC in room 405 is not cooling properly. Temperature remains high despite setting it to lowest.",
    category: "maintenance",
    status: "open",
    priority: "high",
    guestId: "1",
    guestName: "John Guest",
    roomNumber: "405",
    propertyId: "prop-1",
    propertyName: "Sun City Resort",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isAnonymous: false,
  },
  {
    id: "issue-2",
    title: "Noise from adjacent room",
    description:
      "Loud music and party noise from room 406 after 11 PM. Unable to sleep.",
    category: "noise",
    status: "in_progress",
    priority: "medium",
    guestId: "1",
    guestName: "John Guest",
    roomNumber: "405",
    assignedTo: "2",
    assignedToName: "Sarah Staff",
    propertyId: "prop-1",
    propertyName: "Sun City Resort",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isAnonymous: false,
  },
  {
    id: "issue-3",
    title: "Room not cleaned",
    description:
      "Requested room cleaning this morning but it has not been done yet.",
    category: "cleanliness",
    status: "resolved",
    priority: "medium",
    guestId: "1",
    guestName: "John Guest",
    roomNumber: "405",
    assignedTo: "2",
    assignedToName: "Sarah Staff",
    propertyId: "prop-1",
    propertyName: "Sun City Resort",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    isAnonymous: false,
  },
  {
    id: "issue-4",
    title: "Cold food delivered",
    description:
      "Room service delivered cold breakfast. Eggs and toast were not warm.",
    category: "food",
    status: "open",
    priority: "low",
    guestId: "1",
    guestName: "Anonymous",
    roomNumber: "302",
    propertyId: "prop-1",
    propertyName: "Sun City Resort",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    isAnonymous: true,
  },
  {
    id: "issue-5",
    title: "Pool area lighting issue",
    description:
      "Several lights near the pool are not working, making the area dark and unsafe at night.",
    category: "maintenance",
    status: "in_progress",
    priority: "critical",
    guestId: "1",
    guestName: "John Guest",
    assignedTo: "2",
    assignedToName: "Sarah Staff",
    propertyId: "prop-2",
    propertyName: "Table Bay Hotel",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isAnonymous: false,
  },
];

export const mockGuestStats: DashboardStats = {
  totalIssues: 4,
  openIssues: 2,
  inProgressIssues: 1,
  resolvedIssues: 1,
  avgResolutionTime: "2.5 hours",
  slaCompliance: 92,
};

export const mockStaffStats: DashboardStats = {
  totalIssues: 12,
  openIssues: 5,
  inProgressIssues: 4,
  resolvedIssues: 3,
  avgResolutionTime: "1.8 hours",
  slaCompliance: 88,
};

export const mockAdminStats: DashboardStats = {
  totalIssues: 413,
  openIssues: 40,
  inProgressIssues: 28,
  resolvedIssues: 345,
  avgResolutionTime: "45 min",
  slaCompliance: 94,
};

export const DUMMY_ROOMS = [
  {
    code: "ROOM123",
    roomId: "room_1",
    propertyId: "prop_1",
    roomNumber: "101",
  },
  {
    code: "ROOM456",
    roomId: "room_2",
    propertyId: "prop_1",
    roomNumber: "202",
  },
];
