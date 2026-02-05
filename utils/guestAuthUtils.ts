import { db } from "@/db/client";
import { collection, getDocs } from "firebase/firestore";
import { Property, Room, GuestSession } from "@/types";

/**
 * Room code validation result
 */
export interface RoomCodeValidation {
  isValid: boolean;
  property?: Property;
  room?: Room;
  error?: string;
}

/**
 * Validate room code against Firestore properties with rooms array
 * Searches through all properties and their rooms arrays to find a match
 */
export async function validateRoomCode(
  code: string,
): Promise<RoomCodeValidation> {
  try {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return {
        isValid: false,
        error: "Please enter a room code",
      };
    }

    // Query all properties
    const propertiesRef = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesRef);

    // Search through all properties and their rooms arrays
    for (const propertyDoc of propertiesSnapshot.docs) {
      const propertyData = propertyDoc.data();
      const rooms = propertyData.rooms || [];

      // Search for matching room in this property's rooms array
      const matchingRoom = rooms.find((room: Room) => {
        // Match by room number within property code format
        const roomCode =
          `${propertyData.code}-${room.roomNumber}`.toUpperCase();
        return roomCode === normalizedCode || room.id === normalizedCode;
      });

      if (matchingRoom) {
        return {
          isValid: true,
          property: {
            id: propertyDoc.id,
            name: propertyData.name,
            location: propertyData.location,
            code: propertyData.code,
            totalIssues: propertyData.totalIssues || 0,
            openIssues: propertyData.openIssues || 0,
            resolvedIssues: propertyData.resolvedIssues || 0,
            avgResolutionTime: propertyData.avgResolutionTime || 0,
            createdAt: propertyData.createdAt?.toDate?.() || new Date(),
            rooms: rooms,
          },
          room: {
            id: matchingRoom.id,
            roomNumber: matchingRoom.roomNumber,
            status: matchingRoom.status || "available",
            createdAt: matchingRoom.createdAt?.toDate?.() || new Date(),
          },
        };
      }
    }

    return {
      isValid: false,
      error: "Invalid room code. Please check and try again.",
    };
  } catch (error) {
    console.error("Error validating room code:", error);
    return {
      isValid: false,
      error: "Unable to validate code. Please try again.",
    };
  }
}

/**
 * Store guest session in localStorage
 */
export function setGuestSession(session: GuestSession): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("guestSession", JSON.stringify(session));
  } catch (error) {
    console.error("Error storing guest session:", error);
  }
}

/**
 * Retrieve guest session from localStorage
 */
export function getGuestSession(): GuestSession | null {
  if (typeof window === "undefined") return null;

  try {
    const sessionData = localStorage.getItem("guestSession");
    if (!sessionData) return null;

    return JSON.parse(sessionData) as GuestSession;
  } catch (error) {
    console.error("Error retrieving guest session:", error);
    return null;
  }
}

/**
 * Clear guest session from localStorage
 */
export function clearGuestSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("guestSession");
  } catch (error) {
    console.error("Error clearing guest session:", error);
  }
}

/**
 * Validate that a guest session exists and is valid
 */
export function validateGuestSession(): GuestSession | null {
  const session = getGuestSession();

  if (!session) return null;

  // Validate required fields
  const requiredFields: (keyof GuestSession)[] = [
    "uid",
    "role",
    "propertyId",
    "propertyName",
    "roomId",
    "roomNumber",
  ];

  const isValid = requiredFields.every((field) => {
    const value = session[field];
    return value !== undefined && value !== null && value !== "";
  });

  return isValid ? session : null;
}
