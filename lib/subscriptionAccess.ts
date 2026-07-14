import { UserSubscription } from "@/types";

/**
 * Number of days a new account's free trial lasts.
 * Kept in sync with the `trialDays` value written on the subscription
 * document at account-creation time (see /api/session route).
 */
export const TRIAL_DURATION_DAYS = 3; // change to 3 days in production

/**
 * Trial length in milliseconds, derived from TRIAL_DURATION_DAYS.
 */
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * hasSubscriptionAccess
 * ─────────────────────
 * Single source of truth for whether a subscription (belonging to a main
 * admin, and inherited by their staff / inherited-admins) currently
 * grants platform access.
 *
 * Access is granted when either:
 *   - status === "active"    AND hasAccess === true
 *   - status === "trialing"  AND trialEndsAt is in the future
 *
 * Every other status (expired, past_due, canceled, incomplete, unpaid,
 * or a trial whose trialEndsAt has already passed) denies access.
 *
 * This function performs NO writes and has NO side effects. Do not
 * duplicate this logic anywhere else — import and call this helper.
 */
export function hasSubscriptionAccess(
  subscription?: UserSubscription | null,
): boolean {
  if (!subscription) return false;

  if (subscription.status === "active" && subscription.hasAccess) {
    return subscription.hasAccess === true;
  }

  if (subscription.status === "trialing") {
    if (!subscription.trialEndsAt) return false;
    const trialEndsAtMs = new Date(subscription.trialEndsAt).getTime();
    if (Number.isNaN(trialEndsAtMs)) return false;
    // ✅ Re-derived from the real timestamp so a stale `hasAccess: true`
    // (written at trial creation, before the daily expiry job has run)
    // can never grant access past the trial's actual end date.
    return trialEndsAtMs > Date.now();
  }

  // past_due / canceled / incomplete / unpaid / expired / undefined
  return false;
}

/**
 * getTrialDaysRemaining
 * ──────────────────────
 * Returns the number of whole days left in an active trial, or `null`
 * if the subscription isn't currently trialing (or has no trialEndsAt).
 * Never returns a negative number — 0 means "ends today". Callers should
 * still use hasSubscriptionAccess() for actual gating decisions.
 */
export function getTrialDaysRemaining(
  subscription?: UserSubscription | null,
): number | null {
  if (!subscription) return null;
  if (subscription.status !== "trialing") return null;
  if (!subscription.trialEndsAt) return null;

  const trialEndsAtMs = new Date(subscription.trialEndsAt).getTime();
  if (Number.isNaN(trialEndsAtMs)) return null;

  const diffMs = trialEndsAtMs - Date.now();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

/**
 * isTrialExpired
 * ───────────────
 * True when the subscription is a trial whose trialEndsAt has passed —
 * i.e. it *should* be flipped to "expired" but may not have been yet
 * (the daily Cloud Function runs once a day, so there's a window).
 * Used by the sweep job and by UI copy that distinguishes "never
 * subscribed" from "trial ran out".
 */
export function isTrialExpired(
  subscription?: UserSubscription | null,
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "trialing") return false;
  if (!subscription.trialEndsAt) return false;

  const trialEndsAtMs = new Date(subscription.trialEndsAt).getTime();
  if (Number.isNaN(trialEndsAtMs)) return false;

  return trialEndsAtMs <= Date.now();
}
