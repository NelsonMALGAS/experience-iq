import { Issue } from "@/types";

export const createDefaultIssue = (guestSession: {
  uid: string;
  roomNumber?: string;
  propertyId: string;
}): Issue => {
  const now = new Date();

  return {
    id: crypto.randomUUID(), // or Firestore auto-ID later
    title: "",
    description: "",
    category: "room",
    status: "open",
    priority: "medium",

    guestId: guestSession.uid,
    guestName: "Guest",
    roomNumber: guestSession.roomNumber,

    propertyId: guestSession.propertyId,

    assignedTo: undefined,
    assignedToName: undefined,

    createdAt: now,
    updatedAt: now,
    resolvedAt: undefined,

    isAnonymous: true,
  };
};
