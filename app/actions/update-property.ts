"use server";

import { db } from "@/db/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { validateUpdatePropertyInput } from "@/lib/validations/property";

export type UpdatePropertySuccess = {
  success: true;
  message: string;
};

export type UpdatePropertyError = {
  success: false;
  message: string;
  fieldErrors?: Partial<Record<"name" | "location", string[]>>;
};

export type UpdatePropertyResult = UpdatePropertySuccess | UpdatePropertyError;

// ── Server action ─────────────────────────────────────────────────────────────

export async function updateProperty(
  propertyId: string,
  name: string,
  location: string,
): Promise<UpdatePropertyResult> {
  // ── Guard: db must be initialized ─────────────────────────────────────────
  if (!db) {
    throw new Error("Database not initialized");
  }

  // ── Validate input ────────────────────────────────────────────────────────
  const validation = validateUpdatePropertyInput({
    propertyId,
    name,
    location,
  });

  if (!validation.valid) {
    return {
      success: false,
      message: "Validation failed. Please fix the errors below.",
      fieldErrors: validation.fieldErrors as Partial<
        Record<"name" | "location", string[]>
      >,
    };
  }

  // validation.data is guaranteed to exist and trimmed when valid === true
  const {
    propertyId: validId,
    name: validName,
    location: validLocation,
  } = validation.data!;

  try {
    // ── Confirm property exists ───────────────────────────────────────────
    const propertyRef = db.collection("properties").doc(validId);
    const snapshot = await propertyRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Property not found. It may have been deleted.",
      };
    }

    // ── Perform update ────────────────────────────────────────────────────
    await propertyRef.update({
      name: validName,
      location: validLocation,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // ── Revalidate pages ──────────────────────────────────────────────────
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${validId}`);

    return {
      success: true,
      message: "Property updated successfully.",
    };
  } catch (error) {
    console.error("[updateProperty] Firestore error:", error);

    return {
      success: false,
      message:
        "An unexpected error occurred while updating the property. Please try again.",
    };
  }
}
