import { db } from "@/db/client";
import { collection, getDocs } from "firebase/firestore";
import { Property, Room, GuestSession } from "@/types";

export const GUEST_SESSION_KEY = "guestSession";
export const GUEST_ID_KEY = "guestId";
export const GUEST_SESSION_DURATION = 1000 * 60 * 60 * 24 * 3; // 3 days

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
            ownerId: propertyData.ownerId,
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
 * Persist guest session to localStorage, including a loginTimestamp
 * so we can enforce the 7-day expiry on subsequent visits.
 */
export function setGuestSession(
  data: Omit<GuestSession, "loginTimestamp">,
): void {
  if (typeof window === "undefined") return;

  const session: GuestSession = {
    ...data,
    loginTimestamp: Date.now(),
  };

  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  // Keep the legacy guestId key for any code that still reads it directly
  localStorage.setItem(GUEST_ID_KEY, data.uid);
}

/**
 * Read the guest session from localStorage.
 * Returns null when running on the server or when no session exists.
 */
export function getGuestSession(): GuestSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(GUEST_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GuestSession>;

    // Backwards-compat: sessions written before this update won't have
    // loginTimestamp.  Treat them as freshly created so existing guests
    // aren't immediately kicked out.
    if (!parsed.loginTimestamp) {
      parsed.loginTimestamp = Date.now();
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(parsed));
    }

    return parsed as GuestSession;
  } catch {
    return null;
  }
}

/**
 * Returns true when a non-expired, structurally complete session exists.
 */
export function isGuestSessionValid(
  session: GuestSession | null = getGuestSession(),
): boolean {
  if (!session) return false;

  const { uid, propertyId, roomId, loginTimestamp } = session;

  // Must have all required fields
  if (!uid || !propertyId || !roomId) return false;

  // Must not be expired
  if (Date.now() - loginTimestamp > GUEST_SESSION_DURATION) return false;

  return true;
}

/**
 * Wipe all guest session data from localStorage.
 * Call this on logout, "Change Room", or "Check Out".
 */
export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_SESSION_KEY);
  localStorage.removeItem(GUEST_ID_KEY);
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
