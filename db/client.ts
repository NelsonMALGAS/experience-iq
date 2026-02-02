import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as analyticsSupported,
  Analytics,
} from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  getMessaging,
  Messaging,
  isSupported as messagingSupported,
} from "firebase/messaging";

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASURE_ID,
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Auth and Firestore
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleAuth = new GoogleAuthProvider();
const storage: FirebaseStorage = getStorage(app);

let analyticsInstance: Analytics | null = null;
let messagingInstance: Messaging | null = null;

/**
 * Safely initializes Firebase Analytics (client-only).
 * Disabled automatically in development.
 */
export const getAnalyticsSafe = async (): Promise<Analytics | null> => {
  if (process.env.NODE_ENV !== "production") return null;
  if (analyticsInstance) return analyticsInstance;
  if (typeof window === "undefined") return null;

  try {
    const supported = await analyticsSupported();
    if (!supported) return null;

    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  } catch (err) {
    console.warn("Firebase Analytics not supported:", err);
    return null;
  }
};

/**
 * Safely initializes Firebase Cloud Messaging (client-only).
 */
export const getMessagingSafe = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  if (typeof window === "undefined") return null;

  try {
    const supported = await messagingSupported();
    if (!supported) return null;

    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn("Firebase Messaging not supported:", err);
    return null;
  }
};

export { app, db, auth, storage, googleAuth };
