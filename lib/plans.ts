import { PRICE_PLANS } from "@/constants";

export const getPlanByPriceId = (priceId?: string) => {
  if (!priceId) {
    console.error("Price ID is required");
    return null;
  }

  return (
    PRICE_PLANS.find((plan) =>
      Object.values(plan.pricing).some((p) => p.priceId === priceId),
    ) ?? null
  );
};
