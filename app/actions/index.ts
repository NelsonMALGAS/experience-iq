"use server";

import { auth, db } from "@/db/server";
import {
  CreatePropertyData,
  Issue,
  Property,
  UpdatePropertyData,
} from "@/types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { transformFirebaseDates } from "@/lib/transformTimeStamp";
import { AppUser } from "@/types";
import webpush from "web-push";

// VAPID setup
webpush.setVapidDetails(
  "mailto:zmalgas69@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

let subscription: webpush.PushSubscription | null = null;

export async function subscribeUser(serializedSub: webpush.PushSubscription) {
  subscription = serializedSub;
  // Save in DB in production
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  // Remove from DB in production
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/icon.png",
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

/**
 * Fetch all documents from a Firestore collection and return typed data.
 * @param collectionName - Name of the Firestore collection
 * @returns Array of documents with id + data
 */
export const fetchCollection = async <T = unknown>(
  collectionName: string,
): Promise<(T & { id: string })[]> => {
  if (!db) throw new Error("Firestore not initialized");

  const snapshot = await db.collection(collectionName).get();

  return snapshot.docs.map((doc) => {
    const data = transformFirebaseDates(doc.data());

    return {
      id: doc.id,
      ...(data as Record<string, unknown>),
    };
  }) as (T & { id: string })[];
};

/**
 * Fetch a single document from a Firestore collection by ID.
 * @param collectionName - Name of the Firestore collection
 * @param docId - ID of the document to fetch
 * @returns Document data with `id` included, or null if not found
 */
export const fetchDocumentById = async <T>(
  collectionName: string,
  docId: string,
): Promise<(T & { id: string }) | null> => {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = db.collection(collectionName).doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return null;

  return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
};

/**
 * Update a document in Firestore according to the generic type `T`.
 * Only fields in `T` can be updated.
 *
 * @param collectionName - Name of the Firestore collection
 * @param docId - ID of the document to update
 * @param data - Partial fields of T to update
 * @returns Updated document data with id
 */
export const updateDocument = async <T>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
): Promise<(T & { id: string }) | null> => {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = db.collection(collectionName).doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return null;

  // Update only the provided fields
  await docRef.update(data);

  // Return the updated document
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as T & { id: string };
};

/**
 * Delete a document from Firestore by ID.
 * Returns the deleted document data with `id`, or null if not found.
 *
 * @param collectionName - Name of the Firestore collection
 * @param docId - ID of the document to delete
 */
export const deleteDocument = async <T>(
  collectionName: string,
  docId: string,
): Promise<(T & { id: string }) | null> => {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = db.collection(collectionName).doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return null;

  const data = { id: docSnap.id, ...docSnap.data() } as T & { id: string };

  await docRef.delete();

  return data;
};

/**
 * Save an AppUser to Firestore (server-side using Firebase Admin SDK)
 * @param collectionName Firestore collection name (e.g., "users")
 * @param user AppUser object to save
 */
export const saveUserToFirestore = async (
  collectionName: string,
  user: AppUser,
): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  if (!user.uid) throw new Error("User UID is required");

  try {
    const userRef = db.collection(collectionName).doc(user.uid);
    await userRef.set(user, { merge: true }); // merge avoids overwriting existing fields
    console.log(`User ${user.uid} saved to ${collectionName}`);
  } catch (err) {
    console.error("Failed to save user to Firestore:", err);
    throw err;
  }
};

/**
 * Create a new Firebase user (signup)
 */
export const handleSignUp = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<AppUser | null> => {
  try {
    const userRecord = await auth?.createUser({
      email,
      password,
      displayName,
    });

    if (!userRecord) return null;

    return {
      uid: userRecord.uid,
      displayName: userRecord.displayName ?? null,
      email: userRecord.email ?? null,
      photoURL: userRecord.photoURL ?? null,
      emailVerified: userRecord.emailVerified,
      role: "guest",
      property: null,
      isVerified: false,
    };
  } catch (err) {
    console.error("Firebase signup error:", err);
    throw new Error(
      err instanceof Error ? err.message : "Firebase signup error",
    );
  }
};

export const getStaffUsers = async () => {
  if (!auth) {
    console.error("❌ Firebase Admin auth is not initialized");
    return [];
  }

  try {
    const listUsersResult = await auth.listUsers();

    const staffUsers = listUsersResult.users.filter(
      (user) => user.customClaims?.role === "staff",
    );

    return staffUsers;
  } catch (error) {
    console.error("❌ Error fetching staff users:", error);
    return [];
  }
};

interface UpdateIssuePayload {
  assignedTo?: string;
  assignedToName?: string;
  status?: Issue["status"];
  propertyId?: string;
  priority?: Issue["priority"];
}

export async function updateIssue(
  issueId: string,
  propertyId: string,
  updates: UpdateIssuePayload,
) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return {
        success: false,
        message: "Firebase is not initialized",
      };
    }

    // Verify admin authentication
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) {
      throw new Error("Unauthorized: No session found");
    }

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) {
      throw new Error("Unauthorized: Invalid session");
    }

    // Try to get the issue document
    // First, try using propertyId as document ID
    let issueDocRef = db.collection("issues").doc(propertyId);
    let issueDoc = await issueDocRef.get();

    // If not found, try to find the document by querying
    if (!issueDoc.exists) {
      console.log(
        `Document not found with ID: ${propertyId}, searching all documents...`,
      );

      const allIssuesSnapshot = await db.collection("issues").get();

      // Search through all documents to find the one containing this issue
      for (const doc of allIssuesSnapshot.docs) {
        const data = doc.data();
        if (data?.issues) {
          const hasIssue = data.issues.some(
            (issue: Issue) => issue.id === issueId,
          );
          if (hasIssue) {
            issueDocRef = doc.ref;
            issueDoc = doc;
            break;
          }
        }
      }
    }

    if (!issueDoc.exists) {
      const errorMsg = `Issue document not found. Issue ID: ${issueId}, Property ID: ${propertyId}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const data = issueDoc.data();
    if (!data?.issues) {
      throw new Error("Issues array not found in document");
    }

    // Find and update the specific issue
    const issues = data.issues as Issue[];
    const issueIndex = issues.findIndex((i: Issue) => i.id === issueId);

    if (issueIndex === -1) {
      throw new Error(
        `Issue with ID ${issueId} not found in document ${issueDoc.id}`,
      );
    }

    const prevIssue = issues[issueIndex];
    const nextStatus = updates.status ?? prevIssue.status;

    issues[issueIndex] = {
      ...prevIssue,
      ...updates,
      updatedAt: new Date(),
      resolvedAt:
        nextStatus === "resolved" ? (prevIssue.resolvedAt ?? new Date()) : null,
    };

    // Write back to Firestore
    await issueDocRef.update({
      issues,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");

    return { success: true, message: "Issue updated successfully" };
  } catch (error) {
    console.error("Error updating issue:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update issue",
    };
  }
}

export async function bulkUpdateIssueStatus(
  issueIds: string[],
  propertyId: string,
  status: Issue["status"],
) {
  try {
    if (!db) {
      console.error("❌ Firebase is not initialized");
      return {
        success: false,
        message: "Firebase is not initialized",
      };
    }
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) {
      throw new Error("Unauthorized");
    }

    const decoded = await auth?.verifySessionCookie(session, true);
    if (!decoded) {
      throw new Error("Unauthorized");
    }

    const issueDocRef = db.collection("issues").doc(propertyId);
    const issueDoc = await issueDocRef.get();

    if (!issueDoc.exists) {
      throw new Error("Issue document not found");
    }

    const data = issueDoc.data();
    const issues = data?.issues as Issue[];

    // Update all matching issues
    const updatedIssues = issues.map((issue: Issue) => {
      if (issueIds.includes(issue.id)) {
        return {
          ...issue,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    await issueDocRef.update({
      issues: updatedIssues,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin");

    return { success: true, message: "Issues updated successfully" };
  } catch (error) {
    console.error("Error bulk updating issues:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update issues",
    };
  }
}

/**
 * Verify admin authentication
 */
async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore?.get("_SESSION_")?.value;

  if (!session) {
    throw new Error("Unauthorized: No session found");
  }

  const decoded = await auth?.verifySessionCookie(session, true);
  if (!decoded) {
    throw new Error("Unauthorized: Invalid session");
  }

  // Optional: Check if user has admin role in custom claims
  // if (decoded.role !== 'admin') {
  //   throw new Error("Forbidden: Admin access required");
  // }

  return { uid: decoded.uid, role: decoded.role };
}

/**
 * Fetch all properties from Firestore
 */
export async function fetchProperties(): Promise<Property[]> {
  try {
    await verifyAdmin();

    if (!db) throw new Error("Firestore not initialized");

    const propertiesSnapshot = await db
      .collection("properties")
      .orderBy("createdAt", "desc")
      .get();

    const properties: Property[] = propertiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        location: data.location,
        totalIssues: data.totalIssues || 0,
        openIssues: data.openIssues || 0,
        resolvedIssues: 0,
        avgResolutionTime: data.avgResolutionTime || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || undefined,
        code: data.code,
        rooms: data.rooms,
      };
    });

    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
}

/**
 * Create a new property
 */
export async function createProperty(data: CreatePropertyData) {
  try {
    const { uid } = await verifyAdmin();

    // Validate input
    if (!data.name?.trim()) {
      return { success: false, message: "Property name is required" };
    }
    if (!data.location?.trim()) {
      return { success: false, message: "Location is required" };
    }

    if (!data.code?.trim()) {
      return { success: false, message: "Code is required" };
    }

    if (!data.rooms.length || data.rooms.length === 0) {
      return { success: false, message: "Please add atleast 1 room" };
    }

    if (!db) throw new Error("Firestore not initialized");

    // Create property document
    const propertyRef = db.collection("properties").doc();
    await propertyRef.set({
      name: data.name.trim(),
      location: data.location.trim(),
      totalIssues: 0,
      openIssues: 0,
      avgResolutionTime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: uid,
      code: data.code.trim(),
      rooms: data.rooms,
    });

    revalidatePath("/admin/properties");

    return {
      success: true,
      message: "Property created successfully",
      propertyId: propertyRef.id,
    };
  } catch (error) {
    console.error("Error creating property:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create property",
    };
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(
  propertyId: string,
  data: UpdatePropertyData,
) {
  try {
    await verifyAdmin();

    if (!db) throw new Error("Firestore not initialized");

    const propertyRef = db.collection("properties").doc(propertyId);
    const propertyDoc = await propertyRef.get();

    if (!propertyDoc.exists) {
      return { success: false, message: "Property not found" };
    }

    // Update property
    await propertyRef.update({
      ...data,
      updatedAt: new Date(),
    });

    revalidatePath("/admin/properties");

    return { success: true, message: "Property updated successfully" };
  } catch (error) {
    console.error("Error updating property:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update property",
    };
  }
}

/**
 * Delete a property
 */
export async function deleteProperty(propertyId: string) {
  try {
    await verifyAdmin();
    if (!db) throw new Error("Firestore not initialized");

    const propertyRef = db.collection("properties").doc(propertyId);
    const propertyDoc = await propertyRef.get();

    if (!propertyDoc.exists) {
      return { success: false, message: "Property not found" };
    }

    // Delete property
    await propertyRef.delete();

    revalidatePath("/admin/properties");

    return { success: true, message: "Property deleted successfully" };
  } catch (error) {
    console.error("Error deleting property:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}

/**
 * Update property statistics (called when issues are created/resolved)
 */
export async function updatePropertyStats(propertyId: string) {
  try {
    if (!db) throw new Error("Firestore not initialized");
    // Fetch all issues for this property
    const issuesSnapshot = await db.collection("issues").doc(propertyId).get();

    if (!issuesSnapshot.exists) {
      return { success: false, message: "Issues document not found" };
    }

    const issues = issuesSnapshot.data()?.issues || [];

    // Calculate stats
    const totalIssues = issues.length;
    const openIssues = issues.filter(
      (i: Issue) => i.status === "open" || i.status === "in_progress",
    ).length;

    // Calculate average resolution time
    const resolvedIssues = issues.filter(
      (i: Issue) => i.status === "resolved" && i.createdAt && i.updatedAt,
    );
    let avgResolutionTime = 0;

    if (resolvedIssues.length > 0) {
      const totalMinutes = resolvedIssues.reduce(
        (sum: number, issue: Issue) => {
          const created = new Date(issue.createdAt).getTime();
          const resolved = new Date(issue.updatedAt).getTime();
          const minutes = (resolved - created) / (1000 * 60);
          return sum + minutes;
        },
        0,
      );
      avgResolutionTime = Math.round(totalMinutes / resolvedIssues.length);
    }

    // Update property stats
    await db.collection("properties").doc(propertyId).update({
      totalIssues,
      openIssues,
      avgResolutionTime,
      updatedAt: new Date(),
    });

    revalidatePath("/admin/properties");

    return { success: true, message: "Property stats updated" };
  } catch (error) {
    console.error("Error updating property stats:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update stats",
    };
  }
}
