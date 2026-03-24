"use server";

import { db } from "@/db/server";
import { Room } from "@/types";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";

type RoomUpdates = Partial<
  Pick<Room, "status"> & {
    currentGuestName: string | null;
    checkInDate: Date | null;
    checkOutDate: Date | null;
  }
>;

type ActionResult = { success: true } | { success: false; error: string };

async function updateRoomInArray({
  propertyId,
  roomId,
  updates,
}: {
  propertyId: string;
  roomId: string;
  updates: RoomUpdates;
}): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore not initialized.");
    }

    const propertyRef = db.collection("properties").doc(propertyId);
    const snapshot = await propertyRef.get();

    if (!snapshot.exists) {
      throw new Error(`Property ${propertyId} not found.`);
    }

    const data = snapshot.data();
    const rooms: Room[] = data?.rooms ?? [];

    const updatedRooms = rooms.map((room) =>
      room.id === roomId ? { ...room, ...updates } : room,
    );

    await propertyRef.update({ rooms: updatedRooms });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "updateRoomInArray" },
    });
    console.error("Error updating rooms array:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function checkInRoom({
  propertyId,
  roomId,
  name,
  checkInDate,
  checkOutDate,
}: {
  propertyId: string;
  roomId: string;
  name: string;
  checkInDate: Date;
  checkOutDate: Date;
}): Promise<ActionResult> {
  try {
    await updateRoomInArray({
      propertyId,
      roomId,
      updates: {
        status: "occupied",
        currentGuestName: name,
        checkInDate,
        checkOutDate,
      },
    });

    revalidatePath(`/admin/properties/${propertyId}`);
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "checkInRoom" },
    });
    console.error("Error checking guest in:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to checkin guest",
    };
  }
}

export async function checkOutRoom({
  propertyId,
  roomId,
}: {
  propertyId: string;
  roomId: string;
}): Promise<ActionResult> {
  try {
    await updateRoomInArray({
      propertyId,
      roomId,
      updates: {
        status: "available",
        currentGuestName: null,
        checkInDate: null,
        checkOutDate: null,
      },
    });

    revalidatePath(`/admin/properties/${propertyId}`);
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "checkOutRoom" },
    });
    console.error("Error checking guest out:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to checkout guest",
    };
  }
}

export async function setRoomMaintenance({
  propertyId,
  roomId,
}: {
  propertyId: string;
  roomId: string;
}): Promise<ActionResult> {
  try {
    await updateRoomInArray({
      propertyId,
      roomId,
      updates: {
        status: "maintenance",
        currentGuestName: null,
        checkInDate: null,
        checkOutDate: null,
      },
    });

    revalidatePath(`/admin/properties/${propertyId}`);
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "checkOutRoom" },
    });
    console.error("[setRoomMaintenance]", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to set room to maintenance.",
    };
  }
}
