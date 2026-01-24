import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { auth } from "@/db/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types";
import { toast } from "sonner";

/**
 * useCurrentUser hook for managing Firebase authentication and session handling.
 *
 * Provides functionality for:
 * - Monitoring authentication state
 * - Registering users with email and password
 * - Logging in users with email and password
 * - Google Sign-In authentication
 * - Password reset
 * - Signing out users and clearing sessions
 * - Creating session with token and optional FCM token
 *
 * @returns {Object} Object containing current user, loading status, and all auth handler functions:
 * @property {firebase.User|null} currentUser - The currently authenticated user
 * @property {boolean} loading - Whether authentication status is still being determined
 * @property {Function} handleRegister - Registers a user with email, password, and role
 * @property {Function} handleLogin - Logs in a user with email, password, and role
 * @property {Function} handleGoogleSignIn - Handles sign-in using Google OAuth and sets session
 * @property {Function} handlePasswordReset - Sends password reset email
 * @property {Function} handleSignOut - Signs out user and clears server session
 */
const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createSession = async (user: User, role: Role) => {
    if (!user || !role) return;

    const token = await user.getIdToken();

    // ✅ Only now, safely create the session
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, role }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Session creation failed:", error);
      toast.error("Could not create session. Please try again.");
      return;
    }

    const data = await res.json();

    // 🔄 Force token refresh if needed
    if (data?.roleJustSet) {
      await user.getIdToken(true);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    role: Role
  ) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      await createSession(user, role);

      toast.success("Registered successfully", {
        description: "🎉 Success",
      });
      router.push(`/onboarding/${role}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Registration failed; ${error?.message}`, {
          description: "🚨 Error",
        });
      }
      toast.error(`Registration failed: Something went wrong`, {
        description: "🚨 Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string, role: Role) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await createSession(user, role);

      toast.success("Logged in successfully", {
        description: "🎉 Success",
      });
      router.push(`/onboarding/${role}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Login failed: ${error?.message}`, {
          description: "🚨 Error",
        });
      }
      toast.error(`Login failed: Something went wrong`, {
        description: "🚨 Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent", {
        description: "🎉 Success",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to send reset email: ${error?.message}`, {
          description: "🚨 Error",
        });
      }

      toast.error(`Failed to send reset email: Something went wrong`, {
        description: "🚨 Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);

      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
        credentials: "include",
      });

      toast.success("Logged out successfully", {
        description: "🎉 Success",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error signing out: ${error?.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    handleRegister,
    handleLogin,
    handlePasswordReset,
    handleSignOut,
    createSession,
  };
};

export default useCurrentUser;
