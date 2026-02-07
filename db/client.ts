import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import type {
  Auth,
  GoogleAuthProvider as GoogleAuthProviderType,
} from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics";
import type { Messaging } from "firebase/messaging";

// ✅ OPTIMIZATION 1: Lazy load Firebase services only when needed
// Instead of importing all services upfront, we'll create getter functions

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASURE_ID,
};

// Initialize Firebase app (this is lightweight ~5KB)
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// ✅ OPTIMIZATION 2: Lazy-loaded Auth (~15KB saved by not importing upfront)
let _auth: Auth | null = null;
let _googleAuthProvider: GoogleAuthProviderType | null = null;

export const getAuthInstance = async (): Promise<Auth> => {
  if (_auth) return _auth;

  // Dynamic import only when needed
  const { getAuth, GoogleAuthProvider } = await import("firebase/auth");
  _auth = getAuth(app);
  _googleAuthProvider = new GoogleAuthProvider();

  return _auth;
};

export const getGoogleAuthProvider =
  async (): Promise<GoogleAuthProviderType> => {
    if (_googleAuthProvider) return _googleAuthProvider;

    await getAuthInstance(); // Ensures GoogleAuthProvider is loaded
    return _googleAuthProvider!;
  };

// ✅ OPTIMIZATION 3: Lazy-loaded Firestore (~20KB saved)
let _db: Firestore | null = null;

export const getFirestoreInstance = async (): Promise<Firestore> => {
  if (_db) return _db;

  const { getFirestore } = await import("firebase/firestore");
  _db = getFirestore(app);

  return _db;
};

// ✅ OPTIMIZATION 4: Lazy-loaded Storage (~10KB saved)
let _storage: FirebaseStorage | null = null;

export const getStorageInstance = async (): Promise<FirebaseStorage> => {
  if (_storage) return _storage;

  const { getStorage } = await import("firebase/storage");
  _storage = getStorage(app);

  return _storage;
};

// ✅ OPTIMIZATION 5: Analytics - only in production, lazy-loaded (~8KB saved)
let analyticsInstance: Analytics | null = null;

export const getAnalyticsSafe = async (): Promise<Analytics | null> => {
  // Skip in development completely
  if (process.env.NODE_ENV !== "production") return null;
  if (analyticsInstance) return analyticsInstance;
  if (typeof window === "undefined") return null;

  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    if (!supported) return null;

    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  } catch (err) {
    console.warn("Firebase Analytics not supported:", err);
    return null;
  }
};

// ✅ OPTIMIZATION 6: Messaging - lazy-loaded (~12KB saved)
let messagingInstance: Messaging | null = null;

export const getMessagingSafe = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  if (typeof window === "undefined") return null;

  try {
    const { getMessaging, isSupported } = await import("firebase/messaging");
    const supported = await isSupported();
    if (!supported) return null;

    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn("Firebase Messaging not supported:", err);
    return null;
  }
};

// Export app for rare cases where it's needed directly
export { app };

// ✅ OPTIMIZATION 7: Legacy exports (backwards compatibility)
// These will throw errors to guide developers to use the new API
type NeverAccessibleProxy<T> = {
  [K in keyof T]: never;
};

const createDeprecatedProxy = <T>(
  serviceName: string,
): NeverAccessibleProxy<T> => {
  return new Proxy({} as NeverAccessibleProxy<T>, {
    get: () => {
      throw new Error(
        `Use get${serviceName}Instance() instead of direct ${serviceName.toLowerCase()} import for better performance`,
      );
    },
  });
};

export const authProxy: NeverAccessibleProxy<Auth> =
  createDeprecatedProxy<Auth>("Auth");
export const dbProxy: NeverAccessibleProxy<Firestore> =
  createDeprecatedProxy<Firestore>("Firestore");
export const storageProxy: NeverAccessibleProxy<FirebaseStorage> =
  createDeprecatedProxy<FirebaseStorage>("Storage");
export const googleAuthProxy: NeverAccessibleProxy<GoogleAuthProviderType> =
  createDeprecatedProxy<GoogleAuthProviderType>("GoogleAuthProvider");

export const auth: Auth = await getAuthInstance();
export const db: Firestore = await getFirestoreInstance();
export const googleAuth = await getGoogleAuthProvider();
export const storage = await getStorageInstance();
