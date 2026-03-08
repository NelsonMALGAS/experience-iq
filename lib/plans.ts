import { PRICE_PLANS, PricePlan } from "@/constants";

/**
 * Returns the full plan that matches the given priceId, or null if not found.
 * Searches both monthly and yearly pricing across all plans.
 */
export const getPlanByPriceId = (priceId?: string): PricePlan | null => {
  if (!priceId) {
    console.error("getPlanByPriceId: priceId is required");
    return null;
  }

  return (
    PRICE_PLANS.find((plan) =>
      Object.values(plan.pricing).some((p) => p.priceId === priceId),
    ) ?? null
  );
};

/**
 * Returns both the matched plan and the billing interval ("monthly" | "yearly")
 * for the given priceId, or null if not found.
 *
 * Use this when you need to know not just which plan the user is on,
 * but also whether they paid monthly or yearly — e.g. for displaying
 * "Pro Plan · Yearly" in the UI, or for calculating renewal dates.
 *
 * @example
 * const result = getPlanAndIntervalByPriceId("price_1T3vVoGanontDcTu5kDIA2RQ");
 * // { plan: { id: "pro", title: "Pro Plan", ... }, interval: "monthly" }
 */
export const getPlanAndIntervalByPriceId = (
  priceId?: string,
): { plan: PricePlan; interval: "monthly" | "yearly" } | null => {
  if (!priceId) {
    console.error("getPlanAndIntervalByPriceId: priceId is required");
    return null;
  }

  for (const plan of PRICE_PLANS) {
    for (const [interval, pricing] of Object.entries(plan.pricing) as [
      "monthly" | "yearly",
      (typeof plan.pricing)[keyof typeof plan.pricing],
    ][]) {
      if (pricing.priceId === priceId) {
        return { plan, interval };
      }
    }
  }

  return null;
};

/**
 * Returns just the billing interval for a given priceId.
 * Convenience wrapper around getPlanAndIntervalByPriceId.
 */
export const getBillingIntervalByPriceId = (
  priceId?: string,
): "monthly" | "yearly" | null => {
  return getPlanAndIntervalByPriceId(priceId)?.interval ?? null;
};
