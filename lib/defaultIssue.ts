import { Issue } from "@/types";

export const createDefaultIssue = (guestSession: {
  uid: string;
  roomNumber?: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
}): Issue => {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    category: "room",
    status: "open",
    priority: "medium",

    guestId: guestSession.uid,
    guestName: "Guest",
    roomNumber: guestSession.roomNumber,

    propertyId: guestSession.propertyId,
    propertyName: guestSession.propertyName,
    propertyLocation: guestSession.propertyLocation,
    assignedTo: undefined,
    assignedToName: undefined,

    createdAt: now,
    updatedAt: now,
    resolvedAt: undefined,

    isAnonymous: true,
    read: false,
  };
};
