"use server";

import * as Sentry from "@sentry/nextjs";
import { db } from "@/db/server";

/**
 * Complete user registration after onboarding form submission
 * Updates user document with registration data and marks as registered
 */
export async function completeRegistration(
  uid: string,
  registrationData: {
    name: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
  },
) {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "User document not found",
      };
    }

    const currentData = userDoc.data();

    // ✅ Update user document with registration data
    await userRef.update({
      // Registration data
      displayName: registrationData.name,
      phone: registrationData.phone || "",
      address: registrationData.address || "",
      emergencyContact: registrationData.emergencyContact || "",

      // ✅ Mark as registered
      isRegistered: true,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Preserve existing fields
      email: currentData?.email,
      role: currentData?.role,
      department: currentData?.department,
      createdAt: currentData?.createdAt,
    });

    return {
      success: true,
      message: "Registration completed successfully",
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "completeRegistration", uid },
    });
    console.error("Error completing registration:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to complete registration",
    };
  }
}

/**
 * Check if user has completed registration
 * Used by onboarding page to determine if user should be redirected
 */
export async function checkRegistrationStatus(uid: string) {
  try {
    if (!db) throw new Error("Firestore not initialized");

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        exists: false,
        isRegistered: false,
        role: null,
      };
    }

    const data = userDoc.data();

    return {
      exists: true,
      isRegistered: data?.isRegistered === true,
      role: data?.role || null,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "checkRegistrationStatus", uid },
    });
    console.error("Error checking registration status:", error);

    return {
      exists: false,
      isRegistered: false,
      role: null,
    };
  }
}
