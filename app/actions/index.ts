"use server";

import { db, auth } from "@/db/server";
import { AppUser, Role } from "@/types";
import webpush from "web-push";

// VAPID setup
webpush.setVapidDetails(
  "mailto:zmalgas69@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
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
      })
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
  collectionName: string
): Promise<(T & { id: string })[]> => {
  if (!db) throw new Error("Firestore not initialized");

  const snapshot = await db.collection(collectionName).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (T & { id: string })[];
};

/**
 * Fetch a single document from a Firestore collection by ID.
 * @param collectionName - Name of the Firestore collection
 * @param docId - ID of the document to fetch
 * @returns Document data with `id` included, or null if not found
 */
export const fetchDocumentById = async <T>(
  collectionName: string,
  docId: string
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
  data: Partial<T>
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
  docId: string
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
  user: AppUser
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
  displayName?: string
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
      err instanceof Error ? err.message : "Firebase signup error"
    );
  }
};

/**
 * Verify a Firebase user (login)
 * Note: Admin SDK does not handle passwords directly. Normally,
 * you would verify ID tokens from the client, or use Firebase Auth REST API.
 * For simplicity, assume login is via verifying UID or ID token from client.
 */
export const handleLogin = async (
  uid: string,
  role: Role
): Promise<AppUser | null> => {
  try {
    const userRecord = await auth?.getUser(uid);

    console.log(userRecord, "USER RECORD");

    if (!userRecord) return null;

    return {
      uid: userRecord.uid,
      displayName: userRecord.displayName ?? null,
      email: userRecord.email ?? null,
      photoURL: userRecord.photoURL ?? null,
      emailVerified: userRecord.emailVerified,
      role: role,
      property: null,
      isVerified: false,
    };
  } catch (err) {
    console.error("Firebase login error:", err);
    throw new Error(
      err instanceof Error ? err.message : "Failed to login user"
    );
  }
};
