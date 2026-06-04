"use client";

/**
 * hooks/useGuestSession.ts
 *
 * Reusable hook that loads the guest session, checks expiry, and exposes
 * a typed interface to every guest page / component that needs it.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getGuestSession,
  isGuestSessionValid,
  clearGuestSession,
} from "@/utils/guestAuthUtils";
import { getAuthInstance } from "@/db/client";
import { GuestSession } from "@/types";

export interface UseGuestSessionReturn {
  /** The raw session object, or null when not authenticated / expired. */
  session: GuestSession | null;
  /** True once the hook has finished its initial check. */
  loading: boolean;
  /** Convenience flag: session exists AND has not expired. */
  isValid: boolean;
  /**
   * Clears the persisted session and (optionally) signs out the anonymous
   * Firebase user.  Redirects to /login?role=guest afterwards.
   */
  clearSession: (options?: { signOut?: boolean }) => Promise<void>;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

/**
 * @param redirectOnInvalid – when true (default) the hook will automatically
 *   push the user to /login?role=guest if the session is absent or expired.
 */
export function useGuestSession(
  redirectOnInvalid = true,
): UseGuestSessionReturn {
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const stored = getGuestSession();
    const valid = isGuestSessionValid(stored);

    if (!valid) {
      // If there was an expired session, clean it up silently
      if (stored) clearGuestSession();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(null);
      setIsValid(false);

      if (redirectOnInvalid) {
        router.replace("/login?role=guest");
      }
    } else {
      setSession(stored);
      setIsValid(true);
    }

    setLoading(false);
  }, [redirectOnInvalid, router]);

  const clearSession = useCallback(
    async ({ signOut = true }: { signOut?: boolean } = {}) => {
      clearGuestSession();
      setSession(null);
      setIsValid(false);

      if (signOut) {
        try {
          const auth = await getAuthInstance();
          if (auth.currentUser) {
            await auth.signOut();
          }
        } catch {
          // Non-fatal – the localStorage data is already wiped
        }
      }

      router.replace("/login?role=guest");
    },
    [router],
  );

  return { session, loading, isValid, clearSession };
}

export default useGuestSession;
